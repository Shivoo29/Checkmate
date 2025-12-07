"""
Project API routes
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.security import get_current_user
from app.db.session import get_db
from app.db.models import User, Project, Test, Issue
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectWithStats

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new project
    """
    new_project = Project(
        user_id=current_user.id,
        name=project_data.name,
        target_url=str(project_data.target_url),
        description=project_data.description,
        test_config=project_data.test_config
    )

    db.add(new_project)
    db.commit()
    db.refresh(new_project)

    return ProjectResponse.from_orm(new_project)


@router.get("", response_model=List[ProjectWithStats])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all projects for current user
    """
    projects = db.query(Project).filter(
        Project.user_id == current_user.id,
        Project.status != "deleted"
    ).all()

    # Add statistics to each project
    projects_with_stats = []
    for project in projects:
        # Count total tests
        total_tests = db.query(func.count(Test.id)).filter(Test.project_id == project.id).scalar()

        # Get latest test timestamp
        latest_test = db.query(func.max(Test.created_at)).filter(Test.project_id == project.id).scalar()

        # Count critical issues
        critical_issues = db.query(func.count(Issue.id)).join(Test).filter(
            Test.project_id == project.id,
            Issue.severity == "critical",
            Issue.status == "open"
        ).scalar()

        project_dict = ProjectResponse.from_orm(project).dict()
        project_dict["total_tests"] = total_tests or 0
        project_dict["latest_test"] = latest_test
        project_dict["critical_issues"] = critical_issues or 0

        projects_with_stats.append(ProjectWithStats(**project_dict))

    return projects_with_stats


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a specific project
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    return ProjectResponse.from_orm(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update a project
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Update fields
    update_data = project_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if field == "target_url" and value:
            value = str(value)
        setattr(project, field, value)

    db.commit()
    db.refresh(project)

    return ProjectResponse.from_orm(project)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a project (soft delete)
    """
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Soft delete
    project.status = "deleted"
    db.commit()

    return None
