"""
Standalone SMTP Test Script for EcoSense AI
Tests connection, TLS/SSL, authentication, and email delivery.
Reads credentials strictly from .env.
"""
import os
import sys
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formatdate, make_msgid
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
root_dir = Path(__file__).resolve().parent.parent
load_dotenv(root_dir / ".env")

def test_smtp(recipient: str = "test@ecosense.ai"):
    host = os.getenv("SMTP_HOST", "").strip()
    port_str = os.getenv("SMTP_PORT", "587").strip()
    port = int(port_str) if port_str.isdigit() else 587
    user = os.getenv("SMTP_USER", "").strip()
    password = os.getenv("SMTP_PASSWORD", "").strip()
    sender = os.getenv("SMTP_FROM", "").strip() or user or "noreply@ecosense.ai"

    print("=== SMTP CONFIGURATION DIAGNOSTIC ===")
    print(f"SMTP_HOST configured: {bool(host)}")
    print(f"SMTP_PORT: {port}")
    print(f"SMTP_USER configured: {bool(user)}")
    print(f"SMTP_PASSWORD configured: {bool(password)}")
    print(f"SMTP_FROM: {sender}")
    print(f"Target Recipient: {recipient}")
    print("======================================")

    if not host or not user or not password:
        raise ValueError(
            f"Missing required SMTP configuration in .env: "
            f"SMTP_HOST={'SET' if host else 'EMPTY'}, "
            f"SMTP_USER={'SET' if user else 'EMPTY'}, "
            f"SMTP_PASSWORD={'SET' if password else 'EMPTY'}."
        )

    # Build multipart/alternative message (plain-text + HTML for high deliverability)
    msg = MIMEMultipart("alternative")
    msg["Subject"] = "EcoSense AI - SMTP Deliverability Diagnostic Test"
    msg["From"] = sender
    msg["To"] = recipient
    msg["Date"] = formatdate(localtime=True)
    msg["Message-ID"] = make_msgid(domain=host if "." in host else "ecosense.ai")

    text_body = "This is a diagnostic verification email from EcoSense AI Authentication Pipeline."
    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #111;">
        <h2 style="color: #E11D48;">EcoSense AI Verification Diagnostic</h2>
        <p>This is an automated deliverability diagnostic test.</p>
        <p>Timestamp: {formatdate(localtime=True)}</p>
      </body>
    </html>
    """
    msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    print(f"Connecting to {host}:{port} with timeout 15s...")
    if port == 465:
        with smtplib.SMTP_SSL(host, port, timeout=15) as server:
            server.login(user, password)
            server.send_message(msg)
    else:
        with smtplib.SMTP(host, port, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(user, password)
            server.send_message(msg)

    print(f"[SUCCESS] Test email successfully dispatched to {recipient} via {host}:{port}")

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "test@ecosense.ai"
    try:
        test_smtp(target)
    except Exception as e:
        print(f"\n[SMTP FAILURE] {type(e).__name__}: {e}", file=sys.stderr)
        sys.exit(1)
