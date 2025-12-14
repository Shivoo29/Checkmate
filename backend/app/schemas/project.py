"""
Project schemas for request/response validation
"""
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, HttpUrl, UUID4


class ProjectBase(BaseModel):
    """Base project schema"""
    name: str
    target_url: HttpUrl
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    """Schema for project creation"""
    test_config: Optional[Dict[str, Any]] = None


class ProjectUpdate(BaseModel):
    """Schema for project update"""
    name: Optional[str] = None
    target_url: Optional[HttpUrl] = None
    description: Optional[str] = None
    status: Optional[str] = None
    test_config: Optional[Dict[str, Any]] = None


class ProjectResponse(ProjectBase):
    """Schema for project response"""
    id: UUID4
    user_id: UUID4
    status: str
    test_config: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectWithStats(ProjectResponse):
    """Project response with statistics"""
    total_tests: int = 0
    latest_test: Optional[datetime] = None
    critical_issues: int = 0
