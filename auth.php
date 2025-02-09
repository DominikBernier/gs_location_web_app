<?php
session_start();

$correct_password = "GlassShield1234"; // Set your actual password

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST["password"]) && $_POST["password"] === $correct_password) {
        $_SESSION["authenticated"] = true;
        header("Location: index.php"); // Redirect to the main page
        exit();
    } else {
        header("Location: login.html?error=1"); // Redirect back to login if wrong password
        exit();
    }
}
?>
