let history = [];
let chart;

function showSection(id) {
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    const target = document.getElementById(id);
    if (target) {
        target.classList.remove("hidden");
    }
}

function savePatientProfile() {
    const profile = {
        name: document.getElementById("patientName")?.value || "Patient User",
        age: document.getElementById("patientAge")?.value || "42",
        gender: document.getElementById("patientGender")?.value || "Male",
        bloodGroup: document.getElementById("patientBloodGroup")?.value || "O+",
        diabetesType: document.getElementById("patientDiabetesType")?.value || "Type 2"
    };
    localStorage.setItem("patientProfile", JSON.stringify(profile));
    alert("Patient profile saved successfully!");
}

function loadPatientProfile() {
    const saved = localStorage.getItem("patientProfile");
    if (saved) {
        try {
            const profile = JSON.parse(saved);
            if (document.getElementById("patientName")) document.getElementById("patientName").value = profile.name || "";
            if (document.getElementById("patientAge")) document.getElementById("patientAge").value = profile.age || "";
            if (document.getElementById("patientGender")) document.getElementById("patientGender").value = profile.gender || "";
            if (document.getElementById("patientBloodGroup")) document.getElementById("patientBloodGroup").value = profile.bloodGroup || "";
            if (document.getElementById("patientDiabetesType")) document.getElementById("patientDiabetesType").value = profile.diabetesType || "";
        } catch (e) {
            console.error("Error loading patient profile", e);
        }
    } else {
        // Set default demo data if empty
        const defaultProfile = {
            name: "John Doe",
            age: 48,
            gender: "Male",
            bloodGroup: "O+",
            diabetesType: "Type 2"
        };
        if (document.getElementById("patientName") && !document.getElementById("patientName").value) {
            document.getElementById("patientName").value = defaultProfile.name;
            document.getElementById("patientAge").value = defaultProfile.age;
            document.getElementById("patientGender").value = defaultProfile.gender;
            document.getElementById("patientBloodGroup").value = defaultProfile.bloodGroup;
            document.getElementById("patientDiabetesType").value = defaultProfile.diabetesType;
            localStorage.setItem("patientProfile", JSON.stringify(defaultProfile));
        }
    }
}

window.addEventListener("DOMContentLoaded", () => {
    loadPatientProfile();
});

function runOCR() {
    const fileInput = document.getElementById("reportUpload");
    const status = document.getElementById("ocrStatus");

    if (!fileInput.files || !fileInput.files.length) {
        alert("Please upload a lab report");
        return;
    }

    const file = fileInput.files[0];
    status.innerText = "Running OCR... Please wait";

    if (typeof Tesseract !== 'undefined') {
        Tesseract.recognize(
            file,
            "eng",
            { logger: m => console.log(m) }
        ).then(({ data: { text } }) => {
            status.innerText = "OCR completed successfully";
            console.log("OCR TEXT:", text);
            extractMedicalValues(text);
        }).catch(err => {
            status.innerText = "OCR failed. Please enter values manually.";
            console.error(err);
        });
    } else {
        status.innerText = "Tesseract OCR loaded offline. Enter values manually.";
    }
}

function extractMedicalValues(text) {
    text = text.toLowerCase();

    // Regex patterns
    const fastingMatch = text.match(/fasting[^0-9]*([0-9]{2,4}(?:\.[0-9]+)?)/);
    const ppbgMatch = text.match(/post[^0-9]*([0-9]{2,4}(?:\.[0-9]+)?)/);
    const hba1cMatch = text.match(/hb[^0-9]*([0-9]{2,4}(?:\.[0-9]+)?)/);
    const hba1cMatchAlt = text.match(/(hb\s*a\s*1\s*c|glycated)[^0-9]*([0-9]+(\.[0-9]+)?)/);

    if (fastingMatch && document.getElementById("fasting")) {
        document.getElementById("fasting").value = fastingMatch[1];
    }

    if (ppbgMatch && document.getElementById("ppbg")) {
        document.getElementById("ppbg").value = ppbgMatch[1];
    }

    if (hba1cMatch && document.getElementById("hba1c")) {
        document.getElementById("hba1c").value = hba1cMatch[1];
    } else if (hba1cMatchAlt && document.getElementById("hba1c")) {
        document.getElementById("hba1c").value = hba1cMatchAlt[2];
    }

    alert("Medical values extracted. Please verify before analysis.");
}

function analyzeData() {
    const fasting = parseFloat(document.getElementById("fasting")?.value);
    const ppbg = parseFloat(document.getElementById("ppbg")?.value);
    const reportedHbA1c = parseFloat(document.getElementById("hba1c")?.value);

    if (isNaN(fasting) || isNaN(ppbg)) {
        alert("Please enter both fasting and post-prandial glucose values");
        return;
    }

    // 1️⃣ Calculate estimated HbA1c
    const estimatedHbA1c = calculateEstimatedHbA1c(fasting, ppbg);

    // 2️⃣ If lab HbA1c exists → cross-validate
    if (!isNaN(reportedHbA1c)) {
        const diff = Math.abs(estimatedHbA1c - reportedHbA1c);

        if (diff > 1) {
            document.getElementById("decision").innerHTML =
                `<strong>AI Alert:</strong> Significant mismatch between home readings and lab HbA1c.
                 Please recheck values or consult clinician.`;

            document.getElementById("diagnosis").innerHTML =
                `<strong>Status:</strong> Validation Failed`;

            showSection("analysis");
            return;
        }
    }

    // 3️⃣ Use validated HbA1c (prefer lab value)
    const finalHbA1c = !isNaN(reportedHbA1c)
        ? reportedHbA1c
        : parseFloat(estimatedHbA1c.toFixed(1));

    history.push(finalHbA1c);

    // 4️⃣ Classification (ADA rules)
    let diagnosis = "Normal";
    if (finalHbA1c >= 6.5) diagnosis = "Diabetic";
    else if (finalHbA1c >= 5.7) diagnosis = "Prediabetic";

    document.getElementById("diagnosis").innerHTML =
        `<strong>Diagnosis:</strong> ${diagnosis}`;

    // 5️⃣ Trend logic
    let trend = history.length > 1 && finalHbA1c > history[history.length - 2]
        ? "Deteriorating"
        : "Stable / Improving";

    let risk = Math.min(100, Math.round(finalHbA1c * 10));
    if (isNaN(risk)) risk = 0;

    let validationNote = "";

    if (!isNaN(reportedHbA1c)) {
        const diff = Math.abs(estimatedHbA1c - reportedHbA1c);
        if (diff > 0.3) {
            validationNote = " (⚠ Data mismatch detected)";
        }
    }

    document.getElementById("riskScore").innerHTML =
        `<strong>Risk Score:</strong> ${risk}/100`;

    document.getElementById("decision").innerHTML =
        `<strong>AI Decision:</strong> ${trend} glycemic control${validationNote}`;

    showSection("analysis");
    renderChart();
}

function renderChart() {
    const canvas = document.getElementById("trendChart");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (chart) chart.destroy();

    if (typeof Chart !== 'undefined') {
        chart = new Chart(ctx, {
            type: "line",
            data: {
                labels: history.map((_, i) => `Report ${i + 1}`),
                datasets: [{
                    label: "HbA1c Trend (%)",
                    data: history,
                    borderColor: "#7b5cff",
                    backgroundColor: "rgba(123, 92, 255, 0.1)",
                    fill: true,
                    tension: 0.3,
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        suggestedMin: 4,
                        suggestedMax: 12
                    }
                }
            }
        });
    }
}

function calculateEstimatedHbA1c(fasting, ppbg) {
    const avgGlucose = (fasting + ppbg) / 2;
    return ((avgGlucose + 46.7) / 28.7);
}
