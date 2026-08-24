window.onload = function () {
    const tableBody = document.getElementById("patientTable");
    const savedProfile = localStorage.getItem("patientProfile");

    let patient = {
        name: "Anita Sharma",
        age: 45,
        gender: "Female",
        bloodGroup: "O+",
        diabetesType: "Type 2"
    };

    if (savedProfile) {
        try {
            patient = JSON.parse(savedProfile);
        } catch (e) {
            console.error(e);
        }
    }

    tableBody.innerHTML = "";
    const demoPatients = [
        patient,
        {
            name: "Ravi Kumar",
            age: 52,
            gender: "Male",
            bloodGroup: "B+",
            diabetesType: "Type 2"
        }
    ];

    demoPatients.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.name}</td>
            <td>${p.age}</td>
            <td>${p.gender}</td>
            <td>${p.bloodGroup}</td>
            <td>${p.diabetesType}</td>
            <td>
                <a href="patient_index.html" class="upload-link">Upload / View</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
};

function showDoctorProfile() {
    const profileSec = document.getElementById("doctorProfileSection");
    const listSec = document.getElementById("patientListSection");
    const assignedSec = document.getElementById("assignedPatientsSection");

    if (profileSec) profileSec.classList.remove("hidden");
    if (listSec) listSec.classList.add("hidden");
    if (assignedSec) assignedSec.classList.remove("hidden");
}

function showPatientList() {
    const listSec = document.getElementById("patientListSection");
    if (listSec) listSec.classList.remove("hidden");
    loadRandomPatients();
}

function loadRandomPatients() {
    const tableBody = document.getElementById("patientListTable");
    if (!tableBody) return;
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

    patients.forEach(patient => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.bloodGroup}</td>
            <td>${patient.diabetesType}</td>
            <td>
                <a href="patient_index.html" class="upload-link">View / Upload</a>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
