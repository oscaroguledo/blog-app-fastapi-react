"""
Minimal HTML email templates.
"""
from core.config import settings


def _base(title: str, body: str) -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>
    body {{ font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }}
    .container {{ max-width: 600px; margin: 40px auto; background: #fff;
                  border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.1); }}
    .header {{ background: #1a1a2e; color: #fff; padding: 24px 32px; }}
    .header h1 {{ margin: 0; font-size: 22px; }}
    .body {{ padding: 32px; color: #333; line-height: 1.6; }}
    .btn {{ display: inline-block; margin: 24px 0; padding: 12px 28px;
            background: #4f46e5; color: #fff; text-decoration: none;
            border-radius: 6px; font-weight: bold; }}
    .footer {{ padding: 16px 32px; background: #f9f9f9; color: #888;
               font-size: 12px; text-align: center; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>{settings.SMTP_FROM_NAME}</h1></div>
    <div class="body">{body}</div>
    <div class="footer">&copy; {settings.SMTP_FROM_NAME}. You received this email because you have an account with us.</div>
  </div>
</body>
</html>
"""


def welcome_email(first_name: str, verify_url: str) -> tuple[str, str]:
    """Returns (subject, html)."""
    subject = f"Welcome to {settings.SMTP_FROM_NAME}!"
    html = _base(
        subject,
        f"""
        <h2>Hey {first_name}, welcome aboard! 🎉</h2>
        <p>Thanks for signing up. Please verify your email address to get started.</p>
        <a class="btn" href="{verify_url}">Verify Email</a>
        <p>This link expires in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
        """
    )
    return subject, html


def email_verification(first_name: str, verify_url: str) -> tuple[str, str]:
    """Returns (subject, html)."""
    subject = "Verify your email address"
    html = _base(
        subject,
        f"""
        <h2>Hi {first_name},</h2>
        <p>Please verify your email address by clicking the button below.</p>
        <a class="btn" href="{verify_url}">Verify Email</a>
        <p>This link expires in {settings.EMAIL_VERIFICATION_EXPIRE_HOURS} hours.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        """
    )
    return subject, html


def password_reset_email(first_name: str, reset_url: str) -> tuple[str, str]:
    """Returns (subject, html)."""
    subject = "Reset your password"
    html = _base(
        subject,
        f"""
        <h2>Hi {first_name},</h2>
        <p>We received a request to reset your password. Click the button below to choose a new one.</p>
        <a class="btn" href="{reset_url}">Reset Password</a>
        <p>This link expires in {settings.PASSWORD_RESET_EXPIRE_HOURS} hours.</p>
        <p>If you didn't request a password reset, please ignore this email — your password won't change.</p>
        """
    )
    return subject, html


def login_notification_email(first_name: str) -> tuple[str, str]:
    """Returns (subject, html)."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    subject = "New login to your account"
    html = _base(
        subject,
        f"""
        <h2>Hi {first_name},</h2>
        <p>We noticed a new login to your account at <strong>{now}</strong>.</p>
        <p>If this was you, no action is needed.</p>
        <p>If you didn't log in, please <a href="{settings.APP_URL}/reset-password">reset your password</a> immediately.</p>
        """
    )
    return subject, html


def weekly_digest_email(first_name: str, posts: list[dict]) -> tuple[str, str]:
    """Returns (subject, html). posts is a list of post dicts."""
    subject = f"Your weekly digest from {settings.SMTP_FROM_NAME}"

    if not posts:
        posts_html = "<p>No new posts this week. Check back soon!</p>"
    else:
        items = "".join(
            f"""
            <div style="margin-bottom:24px; border-bottom:1px solid #eee; padding-bottom:16px;">
              <h3 style="margin:0 0 8px">
                <a href="{settings.APP_URL}/posts/{p.get('id','')}" style="color:#4f46e5;text-decoration:none;">
                  {p.get('title', 'Untitled')}
                </a>
              </h3>
              <p style="margin:0;color:#555;">{p.get('excerpt','')}</p>
              <small style="color:#999;">{p.get('readingTime', 1)} min read</small>
            </div>
            """
            for p in posts[:5]
        )
        posts_html = f"<p>Here's what's new this week:</p>{items}"

    html = _base(
        subject,
        f"""
        <h2>Hi {first_name},</h2>
        {posts_html}
        <a class="btn" href="{settings.APP_URL}">Read More</a>
        <p style="margin-top:24px;font-size:12px;color:#999;">
          To unsubscribe from weekly digests, visit your
          <a href="{settings.APP_URL}/settings">account settings</a>.
        </p>
        """
    )
    return subject, html
