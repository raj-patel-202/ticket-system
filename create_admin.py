#!/usr/bin/env python3
"""
AuraPass — Admin Account Creation & Management CLI Utility
Usage:
    python create_admin.py --username admin2 --email admin2@example.com --password mysecret
    python create_admin.py --list
    or run without arguments for interactive prompt:
    python create_admin.py
"""

import sys
import os
import re
import argparse
import getpass
from datetime import datetime, timezone
from database.core import get_db_connection, hash_password, init_db

# Ensure utf-8 output compatibility on Windows terminals
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

EMAIL_REGEX = re.compile(r"^[\w\.\+\-]+@[\w\-]+\.[a-zA-Z]{2,}$")

def list_admins():
    init_db()
    conn = get_db_connection()
    admins = conn.execute(
        "SELECT u_id, username, email, created_at FROM users WHERE user_type = 'admin' ORDER BY u_id ASC"
    ).fetchall()
    conn.close()

    print("\n==================================================")
    print("       AuraPass — Registered Administrators       ")
    print("==================================================")
    if not admins:
        print("  (No administrator accounts found)")
    else:
        for a in admins:
            print(f"  ID #{a['u_id']} | User: {a['username']:<15} | Email: {a['email']:<25} | Created: {a['created_at'][:10]}")
    print("==================================================\n")

def create_or_promote_admin(username: str, email: str, password: str) -> bool:
    init_db()
    conn = get_db_connection()
    cursor = conn.cursor()

    username = username.strip()
    email = email.strip().lower()

    if not username or not email or not password:
        print("[!] Error: Username, email, and password cannot be empty.")
        conn.close()
        return False

    if not EMAIL_REGEX.match(email):
        print(f"[!] Error: '{email}' is not a valid email address.")
        conn.close()
        return False

    if len(password) < 6:
        print("[!] Error: Password must be at least 6 characters long.")
        conn.close()
        return False

    # Check if user with same username or email exists
    existing = cursor.execute(
        "SELECT u_id, username, email, user_type FROM users WHERE username = ? OR email = ?",
        (username, email)
    ).fetchone()

    hashed_pw = hash_password(password)
    now = datetime.now(timezone.utc).isoformat()

    if existing:
        u_id = existing["u_id"]
        old_role = existing["user_type"]
        print(f"[*] Existing account found for user ID #{u_id} ('{existing['username']}' / '{existing['email']}').")
        print(f"[*] Updating role from '{old_role}' -> 'admin' and setting new password...")
        
        cursor.execute(
            """
            UPDATE users 
            SET username = ?, email = ?, password = ?, user_type = 'admin'
            WHERE u_id = ?
            """,
            (username, email, hashed_pw, u_id)
        )
        conn.commit()
        conn.close()
        print(f"[+] Successfully promoted user '{username}' (#{u_id}) to platform Administrator!")
        return True
    else:
        cursor.execute(
            """
            INSERT INTO users (username, email, password, user_type, created_at)
            VALUES (?, ?, ?, 'admin', ?)
            """,
            (username, email, hashed_pw, now)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        print(f"[+] Successfully created new Administrator account: '{username}' (#{new_id}) with email '{email}'.")
        return True

def main():
    parser = argparse.ArgumentParser(description="Create or promote an AuraPass Administrator account.")
    parser.add_argument("-u", "--username", help="Administrator username")
    parser.add_argument("-e", "--email", help="Administrator email address")
    parser.add_argument("-p", "--password", help="Administrator password")
    parser.add_argument("-l", "--list", action="store_true", help="List all active administrator accounts")

    args = parser.parse_args()

    if args.list:
        list_admins()
        return

    username = args.username
    email = args.email
    password = args.password

    # If not provided via flags, prompt interactively
    if not username:
        username = input("Enter admin username: ").strip()
    if not email:
        email = input("Enter admin email: ").strip()
    if not password:
        password = getpass.getpass("Enter admin password: ").strip()
        confirm = getpass.getpass("Confirm admin password: ").strip()
        if password != confirm:
            print("[!] Passwords do not match.")
            sys.exit(1)

    success = create_or_promote_admin(username, email, password)
    if not success:
        sys.exit(1)

if __name__ == "__main__":
    main()
