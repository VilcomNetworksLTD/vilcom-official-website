
<!DOCTYPE html>
<html>
<head>
    <title>Staff Invitation - Vilcom Networks</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { padding: 30px; background: #f8f9fa; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 0.9em; border-top: 1px solid #eee; }
        .highlight { background: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🎉 Welcome to Vilcom Networks!</h1>
    </div>

    <div class="content">
        <h2>Hello!</h2>

        <p>You have been invited to join the <strong>Vilcom Networks</strong> team.</p>

        <div class="highlight">
            <p><strong>Your role:</strong> {{ $role }}</p>
            <p><strong>Invited by:</strong> {{ $inviter }}</p>
            <p><strong>Expires:</strong> {{ $expiresAt }}</p>
        </div>

        <p><a href="{{ $acceptUrl }}" class="button">Accept Invitation</a></p>

        <p>If you did not expect this invitation, please ignore this email.</p>
    </div>

    <div class="footer">
        <p>Vilcom Networks - Connect. Innovate. Grow.</p>
    </div>
</body>
</html>

