import hmac
import hashlib
import logging

logger = logging.getLogger(__name__)


def verify_razorpay_signature(raw_body: bytes, signature: str, secret: str) -> bool:
    """
    Verifies incoming Razorpay Webhook signature using HMAC SHA256.

    :param raw_body: Raw request body bytes.
    :param signature: X-Razorpay-Signature header value.
    :param secret: RAZORPAY_WEBHOOK_SECRET configured in environment.
    :return: True if signature is valid, False otherwise.
    """
    if not secret or not signature:
        logger.warning("Razorpay webhook signature verification failed: Missing secret or signature header.")
        return False

    try:
        expected_signature = hmac.new(
            secret.encode("utf-8"),
            raw_body,
            hashlib.sha256
        ).hexdigest()

        is_valid = hmac.compare_digest(expected_signature, signature)
        if not is_valid:
            logger.warning("Razorpay webhook signature mismatch detected.")
        return is_valid
    except Exception as err:
        logger.error(f"Error during Razorpay webhook signature verification: {str(err)}")
        return False
