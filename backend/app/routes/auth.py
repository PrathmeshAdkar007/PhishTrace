from functools import wraps

from flask import Blueprint, jsonify, request, session

from app import db
from app.models.user import User


auth = Blueprint("auth", __name__)


# =========================================================
# AUTHENTICATION HELPER
# =========================================================

def login_required(view_function):
    """
    Protect an API endpoint so only authenticated,
    active users can access it.
    """

    @wraps(view_function)
    def decorated_function(*args, **kwargs):

        user_id = session.get("user_id")

        if not user_id:
            return jsonify({
                "error": "Authentication required"
            }), 401

        user = db.session.get(
            User,
            user_id
        )

        if not user:

            session.clear()

            return jsonify({
                "error": "Authentication required"
            }), 401

        if not user.is_active:

            session.clear()

            return jsonify({
                "error": "User account is inactive"
            }), 403

        return view_function(
            *args,
            **kwargs
        )

    return decorated_function


# =========================================================
# REGISTER
# =========================================================

@auth.post("/api/auth/register")
def register():

    data = request.get_json(
        silent=True
    ) or {}


    username = str(
        data.get("username", "")
    ).strip()


    email = str(
        data.get("email", "")
    ).strip().lower()


    password = data.get(
        "password",
        ""
    )


    # =====================================================
    # VALIDATION
    # =====================================================

    if not username:

        return jsonify({
            "error": "Username is required"
        }), 400


    if len(username) < 3:

        return jsonify({
            "error": "Username must be at least 3 characters long"
        }), 400


    if len(username) > 50:

        return jsonify({
            "error": "Username must not exceed 50 characters"
        }), 400


    if not email:

        return jsonify({
            "error": "Email is required"
        }), 400


    if "@" not in email:

        return jsonify({
            "error": "Invalid email address"
        }), 400


    if not isinstance(password, str):

        return jsonify({
            "error": "Password must be a string"
        }), 400


    if not password.strip():

        return jsonify({
            "error": "Password is required"
        }), 400


    if len(password) < 8:

        return jsonify({
            "error": "Password must be at least 8 characters long"
        }), 400


    if len(password) > 128:

        return jsonify({
            "error": "Password must not exceed 128 characters"
        }), 400


    # =====================================================
    # DUPLICATE USERNAME
    # =====================================================

    existing_username = User.query.filter_by(
        username=username
    ).first()


    if existing_username:

        return jsonify({
            "error": "Username already exists"
        }), 409


    # =====================================================
    # DUPLICATE EMAIL
    # =====================================================

    existing_email = User.query.filter_by(
        email=email
    ).first()


    if existing_email:

        return jsonify({
            "error": "Email already exists"
        }), 409


    # =====================================================
    # CREATE USER
    # =====================================================

    user = User(

        username=username,

        email=email,

        role="analyst",

        is_active=True

    )


    user.set_password(
        password
    )


    try:

        db.session.add(user)

        db.session.commit()

    except Exception:

        db.session.rollback()

        return jsonify({
            "error": "Failed to create user"
        }), 500


    return jsonify({

        "message": "User registered successfully",

        "user": user.to_dict()

    }), 201


# =========================================================
# LOGIN
# =========================================================

@auth.post("/api/auth/login")
def login():

    data = request.get_json(
        silent=True
    ) or {}


    username = str(
        data.get("username", "")
    ).strip()


    password = data.get(
        "password",
        ""
    )


    if not username:

        return jsonify({
            "error": "Username is required"
        }), 400


    if not password:

        return jsonify({
            "error": "Password is required"
        }), 400


    user = User.query.filter_by(
        username=username
    ).first()


    # =====================================================
    # GENERIC AUTH ERROR
    # =====================================================

    if not user:

        return jsonify({
            "error": "Invalid username or password"
        }), 401


    if not user.is_active:

        return jsonify({
            "error": "User account is inactive"
        }), 403


    if not user.check_password(
        password
    ):

        return jsonify({
            "error": "Invalid username or password"
        }), 401


    # =====================================================
    # CREATE NEW SESSION
    # =====================================================

    session.clear()

    session["user_id"] = user.id


    return jsonify({

        "message": "Login successful",

        "user": user.to_dict()

    }), 200


# =========================================================
# CURRENT USER
# =========================================================

@auth.get("/api/auth/me")
def current_user():

    user_id = session.get(
        "user_id"
    )


    if not user_id:

        return jsonify({

            "authenticated": False,

            "user": None

        }), 200


    user = db.session.get(
        User,
        user_id
    )


    if not user:

        session.clear()

        return jsonify({

            "authenticated": False,

            "user": None

        }), 200


    if not user.is_active:

        session.clear()

        return jsonify({

            "authenticated": False,

            "user": None

        }), 200


    return jsonify({

        "authenticated": True,

        "user": user.to_dict()

    }), 200


# =========================================================
# LOGOUT
# =========================================================

@auth.post("/api/auth/logout")
def logout():

    session.clear()


    return jsonify({

        "message": "Logout successful"

    }), 200