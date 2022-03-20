from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import jwt
import database as db
from google_auth import handle_signup, create_user_from_jwt
from io_models import SubscriptionIOModel

app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PUBLIC_KEY = "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6S7asUuzq5Q/3U9rbs+P\nkDVIdjgmtgWreG5qWPsC9xXZKiMV1AiV9LXyqQsAYpCqEDM3XbfmZqGb48yLhb/X\nqZaKgSYaC/h2DjM7lgrIQAp9902Rr8fUmLN2ivr5tnLxUUOnMOc2SQtr9dgzTONY\nW5Zu3PwyvAWk5D6ueIUhLtYzpcB+etoNdL3Ir2746KIy/VUsDwAM7dhrqSK8U2xF\nCGlau4ikOTtvzDownAMHMrfE7q1B6WZQDAQlBmxRQsyKln5DIsKv6xauNsHRgBAK\nctUxZG8M4QJIx3S6Aughd3RZC4Ca5Ae9fd8L8mlNYBCrQhOZ7dS0f4at4arlLcaj\ntwIDAQAB\n-----END PUBLIC KEY-----"


@app.get("/foo")
#TODO rename from foo
async def foo(authorization: Optional[str] = Header(None)):
    # NOT RECOMMENDED TO SKIP SIGNATURE VERIFICATION!!!
    decoded_jwt = jwt.decode(authorization, PUBLIC_KEY, algorithms=["RS256"], options={"verify_signature": False})
    user = create_user_from_jwt(decoded_jwt)
    user_id = user.id
    if not db.user_exists(user):
        handle_signup(user)
    return {"user_id": user_id}


@app.post("/add_subscription")
async def add_subscription(subscription_input: SubscriptionIOModel, authorization: Optional[str] = Header(None)):
    subscription = subscription_input.convert_to_orm_model(authorization)
    db.write_subscription(subscriptions=[subscription])


@app.get("/get_subscriptions")
async def get_subscriptions(authorization: Optional[str] = Header(None)):

    def convert_to_io_model(sub):
        return SubscriptionIOModel(
            date_started=sub.date_started,
            name=sub.name,
            price_in_dollars=sub.price_in_dollars,
            recurs=sub.recurs
        )

    subscriptions = db.get_subscriptions(authorization)
    subscriptions = [convert_to_io_model(subscription) for subscription in subscriptions]
    return {"subscriptions": subscriptions}
