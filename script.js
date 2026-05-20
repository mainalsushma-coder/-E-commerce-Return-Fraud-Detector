let lowRisk = 0;
let mediumRisk = 0;
let highRisk = 0;

let totalCases = 0;
let totalFraudScore = 0;

const checkBtn = document.getElementById("checkBtn");
const tableBody = document.getElementById("tableBody");

// ================= CHECK FRAUD =================

checkBtn.addEventListener("click", function () {

    const customerName =
        document.getElementById("customerName").value.trim();

    const orderId =
        document.getElementById("orderId").value.trim();

    const returnCount =
        Number(document.getElementById("returnCount").value);

    const result =
        document.getElementById("result");

    const score =
        document.getElementById("score");

    const analysisText =
        document.getElementById("analysisText");

    // VALIDATION

    if (!customerName || !orderId || !returnCount) {

        result.innerHTML = "Please fill all fields";
        return;
    }

    // FRAUD SCORE

    let fraudScore =
        Math.min(returnCount * 10, 100);

    totalFraudScore += fraudScore;
    totalCases++;

    score.innerHTML =
        `Fraud Score: ${fraudScore}%`;

    let riskLevel = "";

    // ================= LOW RISK =================

    if (returnCount <= 2) {

        riskLevel = "Low Risk";

        lowRisk++;

        result.innerHTML =
            `Customer ${customerName} is classified as Low Risk.`;

        analysisText.innerHTML =
            "Customer has normal return behavior with low fraud possibility.";
    }

    // ================= MEDIUM RISK =================

    else if (returnCount <= 5) {

        riskLevel = "Medium Risk";

        mediumRisk++;

        result.innerHTML =
            `Customer ${customerName} is classified as Medium Risk.`;

        analysisText.innerHTML =
            "Moderate return activity detected. Monitor future transactions.";
    }

    // ================= HIGH RISK =================

    else {

        riskLevel = "High Risk";

        highRisk++;

        result.innerHTML =
            `Customer ${customerName} is classified as High Risk.`;

        analysisText.innerHTML =
            "High return activity detected. Possible fraudulent behavior.";
    }

    // UPDATE DASHBOARD

    updateStats();
    updateCharts();
    updateRiskBreakdown();

    // ================= TABLE =================

    const currentDate =
        new Date().toLocaleString();

    const row =
        document.createElement("tr");

    row.innerHTML = `
        <td>${customerName}</td>
        <td>${orderId}</td>
        <td>${returnCount}</td>
        <td>${riskLevel}</td>
        <td>${currentDate}</td>
        <td>
            <button onclick="deleteRow(this)">
                Delete
            </button>
        </td>
    `;

    tableBody.appendChild(row);

    saveTable();

    // CLEAR INPUTS

    document.getElementById("customerName").value = "";
    document.getElementById("orderId").value = "";
    document.getElementById("returnCount").value = "";
});

// ================= UPDATE STATS =================

function updateStats() {

    // TOTAL COUNTS

    document.getElementById("totalCases").innerHTML =
        totalCases;

    document.getElementById("lowRiskCount").innerHTML =
        lowRisk;

    document.getElementById("mediumRiskCount").innerHTML =
        mediumRisk;

    document.getElementById("highRiskCount").innerHTML =
        highRisk;

    // AVG FRAUD SCORE

    let average =
        totalCases === 0
        ? 0
        : Math.round(totalFraudScore / totalCases);

    document.getElementById("avgScore").innerHTML =
        average + "%";

    // FRAUD RATE

    let fraudRate =
        totalCases === 0
        ? 0
        : Math.round((highRisk / totalCases) * 100);

    document.getElementById("fraudRate").innerHTML =
        fraudRate + "%";
}

// ================= DELETE =================

function deleteRow(button) {

    button.parentElement.parentElement.remove();

    saveTable();
}

// ================= SEARCH =================

const searchInput =
    document.getElementById("searchInput");

searchInput.addEventListener("keyup", function () {

    const value =
        this.value.toLowerCase();

    document.querySelectorAll("#tableBody tr")
        .forEach(row => {

            const customer =
                row.children[0].textContent.toLowerCase();

            row.style.display =
                customer.includes(value) ? "" : "none";
        });
});

// ================= FILTER =================

const filterRisk =
    document.getElementById("filterRisk");

filterRisk.addEventListener("change", function () {

    const value = this.value;

    document.querySelectorAll("#tableBody tr")
        .forEach(row => {

            const risk =
                row.children[3].textContent;

            row.style.display =
                value === "all" || risk === value
                ? ""
                : "none";
        });
});

// ================= DOWNLOAD CSV =================

const downloadBtn =
    document.getElementById("downloadBtn");

downloadBtn.addEventListener("click", function () {

    let csv = [];

    csv.push(
        "Customer,Order ID,Return Count,Risk,Date"
    );

    document.querySelectorAll("#tableBody tr")
        .forEach(row => {

            let cols = row.querySelectorAll("td");

            let data = [];

            cols.forEach((col, index) => {

                if (index < 5) {
                    data.push(col.innerText);
                }
            });

            csv.push(data.join(","));
        });

    let blob =
        new Blob([csv.join("\n")], {
            type: "text/csv"
        });

    let url =
        URL.createObjectURL(blob);

    let a =
        document.createElement("a");

    a.href = url;

    a.download = "fraud_report.csv";

    a.click();
});

// ================= CLEAR TABLE =================

const clearBtn =
    document.getElementById("clearBtn");

clearBtn.addEventListener("click", function () {

    tableBody.innerHTML = "";

    localStorage.removeItem("fraudTable");
});

// ================= DARK MODE =================

const darkModeBtn =
    document.getElementById("darkModeBtn");

darkModeBtn.addEventListener("click", function () {

    document.body.classList.toggle("dark-mode");
});

// ================= SECTION SWITCH =================

function showSection(id) {

    [
        "dashboardSection",
        "historySection",
        "analyticsSection"
    ].forEach(section => {

        document.getElementById(section)
            .style.display = "none";
    });

    document.getElementById(id)
        .style.display = "block";
}

// ================= LOGOUT =================

document.getElementById("logoutBtn")
.addEventListener("click", function () {

    if (confirm("Logout from Fraud System?")) {

        window.location.href = "index.html";
    }
});

// ================= SAVE TABLE =================

function saveTable() {

    localStorage.setItem(
        "fraudTable",
        tableBody.innerHTML
    );
}

// ================= LOAD DATA =================

window.onload = function () {

    showSection("dashboardSection");

    const savedData =
        localStorage.getItem("fraudTable");

    if (savedData) {

        tableBody.innerHTML = savedData;
    }

    initializeCharts();
};

// ================= CHARTS =================

let barChart;
let pieChart;

function initializeCharts() {

    const barCtx =
        document.getElementById("barChart");

    barChart = new Chart(barCtx, {

        type: "bar",

        data: {

            labels: [
                "Low Risk",
                "Medium Risk",
                "High Risk"
            ],

            datasets: [{

                label: "Customers",

                data: [0, 0, 0]
            }]
        }
    });

    const pieCtx =
        document.getElementById("pieChart");

    pieChart = new Chart(pieCtx, {

        type: "doughnut",

        data: {

            labels: [
                "Low Risk",
                "Medium Risk",
                "High Risk"
            ],

            datasets: [{

                data: [0, 0, 0]
            }]
        }
    });
}

// ================= UPDATE CHARTS =================

function updateCharts() {

    barChart.data.datasets[0].data = [
        lowRisk,
        mediumRisk,
        highRisk
    ];

    pieChart.data.datasets[0].data = [
        lowRisk,
        mediumRisk,
        highRisk
    ];

    barChart.update();

    pieChart.update();
}

// ================= RISK BREAKDOWN =================

function updateRiskBreakdown() {

    if (!document.getElementById("lowPercent"))
        return;

    let lowPercent =
        totalCases === 0
        ? 0
        : Math.round((lowRisk / totalCases) * 100);

    let mediumPercent =
        totalCases === 0
        ? 0
        : Math.round((mediumRisk / totalCases) * 100);

    let highPercent =
        totalCases === 0
        ? 0
        : Math.round((highRisk / totalCases) * 100);

    document.getElementById("lowPercent")
        .innerHTML = lowPercent + "%";

    document.getElementById("mediumPercent")
        .innerHTML = mediumPercent + "%";

    document.getElementById("highPercent")
        .innerHTML = highPercent + "%";

    document.getElementById("lowBar")
        .style.width = lowPercent + "%";

    document.getElementById("mediumBar")
        .style.width = mediumPercent + "%";

    document.getElementById("highBar")
        .style.width = highPercent + "%";
}