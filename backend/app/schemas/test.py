"""
Test schemas for request/response validation
"""
from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, UUID4

from app.db.models import TestStatus


class TestCreate(BaseModel):
    """Schema for test creation"""
    project_id: UUID4
    test_type: str = "full"  # full, auth, performance, security, ui
    config: Optional[Dict[str, Any]] = None


class TestResponse(BaseModel):
    """Schema for test response"""
    id: UUID4
    project_id: UUID4
    test_type: str
    status: TestStatus
    results: Optional[Dict[str, Any]] = None
    screenshots: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class IssueCreate(BaseModel):
    """Schema for issue creation"""
    test_id: UUID4
    severity: str
    category: str
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    element_selector: Optional[str] = None
    screenshot_url: Optional[str] = None
    code_snippet: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class IssueResponse(BaseModel):
    """Schema for issue response"""
    id: UUID4
    test_id: UUID4
    severity: str
    category: str
    title: str
    description: Optional[str] = None
    url: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ManualTestSubmit(BaseModel):
    """Schema for manual test submission"""
    test_id: UUID4
    test_data: Dict[str, Any]
    screenshots: Optional[List[str]] = None
    videos: Optional[List[str]] = None
    test_duration_seconds: Optional[int] = None
