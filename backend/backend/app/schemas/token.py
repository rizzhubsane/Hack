from pydantic import BaseModel
from typing import Optional, Union

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str # "user" or "provider"
    user_id: int
    username: str

class TokenData(BaseModel):
    username: Union[str, None] = None
    user_type: Union[str, None] = None
