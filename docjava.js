window.onload = function () {
    const tableBody = document.getElementById("patientTable");
    const savedProfile = localStorage.getItem("patientProfile");

    if (!savedProfile) {
        tableBody.innerHTML =
            `<tr><td colspan="6">No patient records available</td></tr>`;
        return;
    }

    const patient = JSON.parse(savedProfile);

    for (let i = 0; i < 2; i++) {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.bloodGroup}</td>
            <td>${patient.diabetesType}</td>
            <td>
                <a href="index.html">Upload / View</a>
            </td>
        `;

        tableBody.appendChild(row);
    }
};
function showDoctorProfile() {
    document.getElementById("patientListSection").classList.add("hidden");
}

function showPatientList() {
    document.getElementById("patientListSection").classList.remove("hidden");
    loadRandomPatients();
}
function loadRandomPatients() {
    const tableBody = document.getElementById("patientListTable");
    tableBody.innerHTML = "";

    const patients = [
        {
            name: "Anita Sharma",
            age: 45,
            gender: "Female",
            bloodGroup: "O+",
            diabetesType: "Type 2"
        },
        {
            name: "Ravi Kumar",
            age: 52,
            gender: "Male",
            bloodGroup: "B+",
            diabetesType: "Type 2"
        },
        {
            name: "Suresh Iyer",
            age: 38,
            gender: "Male",
            bloodGroup: "A+",
            diabetesType: "Prediabetic"
        },
        {
            name: "Meena Patel",
            age: 60,
            gender: "Female",
            bloodGroup: "AB+",
            diabetesType: "Type 1"
        }
    ];

    // Pick any 2 random patients
    const shuffled = patients.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 2);

    selected.forEach(patient => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.bloodGroup}</td>
            <td>${patient.diabetesType}</td>
            <td>
                <a href="index.html">View / Upload</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
