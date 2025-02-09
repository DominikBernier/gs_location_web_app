<?php
session_start();
if (!isset($_SESSION["authenticated"]) || $_SESSION["authenticated"] !== true) {
    header("Location: login.html"); // Redirect if not logged in
    exit();
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Location Finder</title>
    <link rel="stylesheet" href="style.css">
    <script src="script.js"></script>
</head>
<body>
    <h2>Find Nearby Locations</h2>
    <button onclick="getLocation()">Get My Location</button>
    <button onclick="generateRoute()">Find Best Route</button>
    <a href="logout.php">Logout</a>
    <p id="status">Click the button to find locations.</p>
    <span id="loader" class="loader"></span>
    <div id="results"></div>
</body>
</html>