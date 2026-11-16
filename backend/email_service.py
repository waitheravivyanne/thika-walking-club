
import os

import sib_api_v3_sdk
from sib_api_v3_sdk.rest import ApiException


def send_email(recipient, subject, html_content):

    api_key = os.getenv("BREVO_API_KEY")
    sender_email = os.getenv("MAIL_FROM")

    if not api_key or not sender_email:
        print("Email configuration is missing.")
        return False

    configuration = sib_api_v3_sdk.Configuration()
    configuration.api_key["api-key"] = api_key

    try:
        with sib_api_v3_sdk.ApiClient(configuration) as api_client:

            email_api = sib_api_v3_sdk.TransactionalEmailsApi(
                api_client
            )

            email = sib_api_v3_sdk.SendSmtpEmail(
                to=[{"email": recipient}],
                sender={
                    "name": "Thika Walking Club",
                    "email": sender_email
                },
                subject=subject,
                html_content=html_content
            )

            email_api.send_transac_email(email)

            return True

    except ApiException:
        print("Brevo could not send the email.")
        return False
