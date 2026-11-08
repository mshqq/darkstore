from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class SupplierCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    inn: str = Field(pattern=r"^\d{10}(\d{2})?$")
    contact_person: str = Field(min_length=1, max_length=255)
    address: str = Field(min_length=1, max_length=255)
    phone: str = Field(min_length=5, max_length=32)
    email: EmailStr | None = None


class SupplierUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    inn: str | None = Field(pattern=r"^\d{10}(\d{2})?$")
    contact_person: str | None = Field(default=None, min_length=1, max_length=255)
    address: str | None = Field(default=None, min_length=1, max_length=255)
    phone: str | None = Field(default=None, min_length=5, max_length=32)
    email: EmailStr | None = None


class SupplierRead(BaseModel):
    id: int
    name: str
    inn: str
    contact_person: str
    address: str
    phone: str
    email: EmailStr | None
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
