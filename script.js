let history = [];
let chart;

function showSection(id) {
    document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
}

function runOCR() {
    const fileInput = document.getElementById("reportUpload");
    const status = document.getElementById("ocrStatus");

    if (!fileInput.files.length) {
        alert("Please upload a lab report");
        return;
    }

    const file = fileInput.files[0];
    status.innerText = "Running OCR... Please wait";

    Tesseract.recognize(
        file,
        "eng",
        { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
        status.innerText = "OCR completed successfully";
        
        console.log("OCR TEXT:", text);
        extractMedicalValues(text);
    }).catch(err => {
        status.innerText = "OCR failed";
        console.error(err);
    });
}

function extractMedicalValues(text) {
    text = text.toLowerCase();
 //alert("--->");
 //alert(text);


    // Regex patterns (basic but effective)
    //const fastingMatch = text.match(/fasting[^0-9]*([0-9]{2,3})/);
    const fastingMatch = text.match(/fasting[^0-9]*([0-9]{2,4}(?:\.[0-9]+)?)/);

    const ppbgMatch = text.match(/post[^0-9]*([0-9]{2,4}(?:\.[0-9]+)?)/);
    const hba1cMatch = text.match(/hb[^0-9]*([0-9]{2,4}(?:\.[0-9]+)?)/);
    const hba1cMatchAlt = text.match(/(hb\s*a\s*1\s*c|glycated)[^0-9]*([0-9]+(\.[0-9]+)?)/);

    if (fastingMatch) {
        document.getElementById("fasting").value = fastingMatch[1];
    }

    if (ppbgMatch) {
        document.getElementById("ppbg").value = ppbgMatch[1];
    }

    if (hba1cMatch) {
    document.getElementById("hba1c").value = hba1cMatch[1];
} else if (hba1cMatchAlt) {
    document.getElementById("hba1c").value = hba1cMatchAlt[2];
}


    if (hba1cMatch) {
        document.getElementById("hba1c").value =hba1cMatch[1];
    }


    alert("Medical values extracted. Please verify before analysis.");
}



function analyzeData() {
    const fasting = parseFloat(document.getElementById("fasting").value);
    const ppbg = parseFloat(document.getElementById("ppbg").value);
    const hba1c = parseFloat(document.getElementById("hba1c").value);

    history.push(hba1c);

    let diagnosis = "Normal";
    if (hba1c >= 6.5) diagnosis = "Diabetic";
    else if (hba1c >= 5.7) diagnosis = "Prediabetic";

    document.getElementById("diagnosis").innerHTML =
        `<strong>Diagnosis:</strong> ${diagnosis}`;

    let trend = history.length > 1 && hba1c > history[history.length - 2]
        ? "Deteriorating"
        : "Stable / Improving";

    let risk = Math.min(100, hba1c * 10);
    document.getElementById("riskScore").innerHTML =
        `<strong>Risk Score:</strong> ${risk}/100`;

    document.getElementById("decision").innerHTML =
        `<strong>AI Decision:</strong> ${trend} control – Clinical review recommended`;

    renderChart();
}
function analyzeData() {
    const fasting = parseFloat(document.getElementById("fasting").value);
    const ppbg = parseFloat(document.getElementById("ppbg").value);
    const reportedHbA1c = parseFloat(document.getElementById("hba1c").value);

    if (isNaN(fasting) || isNaN(ppbg)) {
        alert("Please enter both fasting and post-prandial glucose values");
        return;
    }

    // 1️⃣ Calculate estimated HbA1c
    const estimatedHbA1c = calculateEstimatedHbA1c(fasting, ppbg);
   //alert(estimatedHbA1c);
    //alert(reportedHbA1c);
   //alert( isNaN(reportedHbA1c));
    // 2️⃣ If lab HbA1c exists → cross-validate
    if (!isNaN(reportedHbA1c)) {
        const diff = Math.abs(estimatedHbA1c - reportedHbA1c);
         //alert("DIFFVAL");
        //alert(diff);

        if (diff > 1) {
            document.getElementById("decision").innerHTML =
                `<strong>AI Alert:</strong> Significant mismatch between home readings and lab HbA1c.
                 Please recheck values or consult clinician.`;

            document.getElementById("diagnosis").innerHTML =
                `<strong>Status:</strong> Validation Failed`;

            return;
        }
    }

    // 3️⃣ Use validated HbA1c (prefer lab value)
    const finalHbA1c = !isNaN(reportedHbA1c)
        ? reportedHbA1c
        : estimatedHbA1c;

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
        validationNote = "⚠ Data mismatch detected";
    }
}

    document.getElementById("riskScore").innerHTML =
        `<strong>Risk Score:</strong> ${risk}/100`;

    document.getElementById("decision").innerHTML =
        `<strong>AI Decision:</strong> ${trend} glycemic control`;

    document.getElementById("decision").innerHTML =
    `<strong>AI Decision:</strong> ${trend} glycemic control ${validationNote}`;


    

    renderChart();
}

function renderChart() {
    const ctx = document.getElementById("trendChart").getContext("2d");
    if (chart) chart.destroy();

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels: history.map((_, i) => `Report ${i + 1}`),
            datasets: [{
                label: "HbA1c Trend",
                data: history,
                borderWidth: 2
            }]
        }
    });
}
function calculateEstimatedHbA1c(fasting, ppbg) {
    const avgGlucose = (fasting + ppbg) / 2;
    return ((avgGlucose + 46.7) / 28.7);
}

