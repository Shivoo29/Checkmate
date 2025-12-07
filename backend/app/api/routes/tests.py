"""
Test API routes
"""
from typing import List
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.db.models import User, Project, Test, TestStatus, Issue
from app.schemas.test import TestCreate, TestResponse, IssueResponse, ManualTestSubmit

router = APIRouter(prefix="/tests", tags=["Tests"])


async def run_test_job(test_id: str, project_url: str, test_type: str):
    """
    Background task to run test (placeholder)
    This would call the bot-engine to actually run tests
    """
    # TODO: Integrate with bot-engine
    # For now, this is a placeholder
    import time
    from app.db.session import SessionLocal

    db = SessionLocal()
    try:
        test = db.query(Test).filter(Test.id == test_id).first()
        if test:
            test.status = TestStatus.RUNNING
            test.started_at = datetime.utcnow()
            db.commit()

            # Simulate test execution
            time.sleep(5)

            # Update test status
            test.status = TestStatus.COMPLETED
            test.completed_at = datetime.utcnow()
            test.duration_seconds = 5
            test.results = {
                "summary": "Test completed successfully",
                "stats": {
                    "total_checks": 25,
                    "passed": 22,
                    "failed": 3
                }
            }
            db.commit()
    finally:
        db.close()


@router.post("", response_model=TestResponse, status_code=status.HTTP_201_CREATED)
async def create_test(
    test_data: TestCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create and start a new test
    """
    # Verify project belongs to user
    project = db.query(Project).filter(
        Project.id == test_data.project_id,
        Project.user_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    # Create test
    new_test = Test(
        project_id=project.id,
        test_type=test_data.test_type,
        status=TestStatus.PENDING
    )

    db.add(new_test)
    db.commit()
    db.refresh(new_test)

    # Queue test execution in background
    background_tasks.add_task(
        run_test_job,
        str(new_test.id),
        project.target_url,
        test_data.test_type
    )

    return TestResponse.from_orm(new_test)


@router.get("/{test_id}", response_model=TestResponse)
async def get_test(
    test_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get test details
    """
    test = db.query(Test).join(Project).filter(
        Test.id == test_id,
        Project.user_id == current_user.id
    ).first()

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )

    return TestResponse.from_orm(test)


@router.get("/{test_id}/issues", response_model=List[IssueResponse])
async def get_test_issues(
    test_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all issues for a test
    """
    # Verify test belongs to user
    test = db.query(Test).join(Project).filter(
        Test.id == test_id,
        Project.user_id == current_user.id
    ).first()

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )

    issues = db.query(Issue).filter(Issue.test_id == test_id).all()

    return [IssueResponse.from_orm(issue) for issue in issues]


@router.post("/{test_id}/manual", status_code=status.HTTP_201_CREATED)
async def submit_manual_test(
    test_id: str,
    manual_data: ManualTestSubmit,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit manual test results
    """
    # Verify test belongs to user
    test = db.query(Test).join(Project).filter(
        Test.id == test_id,
        Project.user_id == current_user.id
    ).first()

    if not test:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Test not found"
        )

    # Store manual test results
    from app.db.models import ManualTestResult

    manual_result = ManualTestResult(
        test_id=test.id,
        user_id=current_user.id,
        test_data=manual_data.test_data,
        screenshots=manual_data.screenshots,
        videos=manual_data.videos,
        test_duration_seconds=manual_data.test_duration_seconds
    )

    db.add(manual_result)
    db.commit()

    return {"message": "Manual test results submitted successfully"}
