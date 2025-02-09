let selectedAddresses = [];
let maxWaypoints = 10;
let userLocation = null;
let glassShieldCoordinates = [45.34786, -73.69077];
function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            function(position) {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                console.log(document.getElementById("getLocationBtn"));
                document.getElementById("getLocationBtn").disabled = true;
                document.getElementById("status").innerText = "Location obtained! Sending...";
                document.getElementById("loader").style.display = "inline-block"; 
                sendLocation(userLocation.latitude, userLocation.longitude);
            },
            function(error) {
                document.getElementById("status").innerText = "Error getting location: " + error.message;
            }
        );
    } else {
        document.getElementById("status").innerText = "Geolocation not supported by this browser.";
    }
}

function sendLocation(lat, lng) {
    let url = "https://script.google.com/macros/s/AKfycbxxfU6ifcbqGgy_Gz8E9F0jGzZJZ4AcfvdpM0QidNoMXBRIoTg45jZlfsiY7Uwm5_di/exec";

    let requestData = { latitude: lat, longitude: lng };
    
    fetch(url, {
        redirect: "follow",
        method: "POST",
        body: JSON.stringify(requestData),
        headers: {
            "Content-Type": "text/plain;charset=utf-8",
        },
    })
    .then(response => response.json())
    .then(data => displayResults(data))
    .catch(error => console.error("Fetch Error:", error));
}

function displayResults(data) {
    document.getElementById("getLocationBtn").disabled = false;
    selectedAddresses = [];
    let resultDiv = document.getElementById("results");
    resultDiv.innerHTML = "";
    document.getElementById("loader").style.display = "none";

    if (data.error) {
        resultDiv.innerHTML = `<p>Error: ${data.error}</p>`;
        return;
    }

    if (data.length === 0) {
        resultDiv.innerHTML = "<p>No locations found.</p>";
        return;
    }

    // Function to extract numeric value from a "X km" or "X mi" string
    function extractDistanceValue(distanceStr) {
        return parseFloat(distanceStr.replace(/[^\d.]/g, "")); // Remove non-numeric characters
    }

    // Function to extract travel time in minutes
    function extractTravelTimeValue(timeStr) {
        let minutes = 0;
        let parts = timeStr.match(/(\d+)\s*(hour|hr|h)/i);
        if (parts) minutes += parseInt(parts[1]) * 60; // Convert hours to minutes
        parts = timeStr.match(/(\d+)\s*(minute|min|m)/i);
        if (parts) minutes += parseInt(parts[1]); // Add minutes
        return minutes;
    }

    // Sort data: First by distance, then by travel time if distances are equal
    data.sort((a, b) => {
        let distanceA = extractDistanceValue(a.distance);
        let distanceB = extractDistanceValue(b.distance);
        let timeA = extractTravelTimeValue(a.travel_time);
        let timeB = extractTravelTimeValue(b.travel_time);

        if (distanceA === distanceB) {
            return timeA - timeB; // If distances are equal, sort by travel time
        }
        return distanceA - distanceB; // Otherwise, sort by distance
    });

    let tableContainer = document.createElement("div");
    tableContainer.classList.add("table-container");

    let table = document.createElement("table");

    let thead = document.createElement("thead");
    let headerRow = document.createElement("tr");
    let headers = ["Select", "Name", "Address", "Distance", "Travel Time"];

    headers.forEach(text => {
        let th = document.createElement("th");
        th.textContent = text;
        headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);
    table.appendChild(thead);

    let tbody = document.createElement("tbody");

    data.forEach(entry => {
        let row = document.createElement("tr");

        let checkboxCell = document.createElement("td");
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.addEventListener("change", function() {
            toggleSelection(row, entry.address, this);
        });

        checkboxCell.appendChild(checkbox);
        row.appendChild(checkboxCell);

        let nameCell = document.createElement("td");
        nameCell.textContent = entry.name;
        row.appendChild(nameCell);

        let addressCell = document.createElement("td");
        addressCell.textContent = entry.address;
        row.appendChild(addressCell);

        let distanceCell = document.createElement("td");
        distanceCell.textContent = entry.distance;
        row.appendChild(distanceCell);

        let travelTimeCell = document.createElement("td");
        travelTimeCell.textContent = entry.travel_time;
        row.appendChild(travelTimeCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    tableContainer.appendChild(table);
    resultDiv.appendChild(tableContainer);
    document.getElementById("status").innerText = "Results received!";
}


function toggleSelection(row, address, checkbox) {
    if (checkbox.checked) {
        if (selectedAddresses.length < maxWaypoints) {
            selectedAddresses.push(address);
            row.classList.add("highlight");
        } else {
            checkbox.checked = false;
            alert(`You can select up to ${maxWaypoints} waypoints.`);
        }
    } else {
        let index = selectedAddresses.indexOf(address);
        if (index > -1) {
            selectedAddresses.splice(index, 1);
        }
        row.classList.remove("highlight");
    }
}

function generateRoute() {
    if (!userLocation) {
        alert("Please get your location first.");
        return;
    }
    if (selectedAddresses.length === 0) {
        alert("Please select at least one waypoint.");
        return;
    }
    let origin = `${userLocation.latitude},${userLocation.longitude}`;
    let destination = `${glassShieldCoordinates[0]},${glassShieldCoordinates[1]}`;
    let waypoints = selectedAddresses.map(encodeURIComponent).join("|");
    let mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&waypoints=${waypoints}&optimize=true`;
    window.open(mapsUrl, "_blank");
}
