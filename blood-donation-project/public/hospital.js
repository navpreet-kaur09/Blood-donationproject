document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    const KEYS = {
        INVENTORY: "jeevanHospitalInventory",
        CAMPS: "jeevanHospitalCamps",
        DONOR_STATUS: "jeevanHospitalDonorStatus",
        SESSION: "jeevanHospitalSession",
        USERS: "jeevanUsers",
        REQUESTS: "jeevanBloodRequests"
    };

    const DEMO_HOSPITALS = window.JeevanDemoData.hospitals;

    const ALL_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

    const DEFAULT_INVENTORY = [
        { id: "inv_1", bloodGroup: "A+", component: "Whole Blood", units: 14, expiry: getFutureDate(28), location: "Cold Storage 1 - Rack A" },
        { id: "inv_2", bloodGroup: "O+", component: "Packed Red Cells", units: 18, expiry: getFutureDate(35), location: "Cold Storage 1 - Rack B" },
        { id: "inv_3", bloodGroup: "B+", component: "Platelets", units: 3, expiry: getFutureDate(5), location: "Platelet Agitator 1" },
        { id: "inv_4", bloodGroup: "AB+", component: "Fresh Frozen Plasma", units: 10, expiry: getFutureDate(90), location: "Deep Freezer -25C" },
        { id: "inv_5", bloodGroup: "O-", component: "Whole Blood", units: 2, expiry: getFutureDate(21), location: "Emergency Reserve Unit" },
        { id: "inv_6", bloodGroup: "B-", component: "Packed Red Cells", units: 6, expiry: getFutureDate(30), location: "Cold Storage 2 - Rack D" }
    ];

    const DEFAULT_CAMPS = [
        { id: "camp_1", name: "Community Lifesaver Blood Drive", organizer: "Rotary Club & GMCH", date: getFutureDate(8), timing: "09:00 AM – 04:00 PM", venue: "Sector 17 Plaza, Chandigarh", target: 120, status: "Scheduled" },
        { id: "camp_2", name: "Youth Blood Donation Drive", organizer: "NSS & Jeevan Team", date: getFutureDate(18), timing: "10:00 AM – 03:30 PM", venue: "Panjab University Campus", target: 80, status: "Scheduled" }
    ];

    const verificationForm = document.getElementById("hospitalVerificationForm");
    const governmentIdInput = document.getElementById("governmentId");
    const verificationResult = document.getElementById("verificationResult");
    const resultTitle = document.getElementById("resultTitle");
    const resultMessage = document.getElementById("resultMessage");

    const managementSection = document.getElementById("hospitalManagementSection");
    const displayHospitalName = document.getElementById("displayHospitalName");
    const displayHospitalId = document.getElementById("displayHospitalId");
    const exitHospitalBtn = document.getElementById("exitHospitalBtn");
    const resetDemoDataBtn = document.getElementById("resetDemoDataBtn");

    const statTotalUnits = document.getElementById("statTotalUnits");
    const statLowStock = document.getElementById("statLowStock");
    const statActiveCamps = document.getElementById("statActiveCamps");
    const statActiveDonors = document.getElementById("statActiveDonors");

    const tabButtons = document.querySelectorAll(".hospital-tab-link");
    const tabContents = document.querySelectorAll(".hospital-tab-content");

    const addInventoryForm = document.getElementById("addInventoryForm");
    const inventoryBloodGroup = document.getElementById("inventoryBloodGroup");
    const inventoryComponent = document.getElementById("inventoryComponent");
    const inventoryUnits = document.getElementById("inventoryUnits");
    const inventoryExpiry = document.getElementById("inventoryExpiry");
    const inventoryLocation = document.getElementById("inventoryLocation");
    const editInventoryId = document.getElementById("editInventoryId");
    const inventoryFormHeading = document.getElementById("inventoryFormHeading");
    const saveInventoryBtn = document.getElementById("saveInventoryBtn");
    const inventoryEditBanner = document.getElementById("inventoryEditBanner");
    const cancelEditBtn = document.getElementById("cancelEditBtn");
    const inventoryTableBody = document.getElementById("inventoryTableBody");
    const inventoryEmptyState = document.getElementById("inventoryEmptyState");
    const filterBloodGroup = document.getElementById("filterBloodGroup");
    const filterStockStatus = document.getElementById("filterStockStatus");

    const addCampForm = document.getElementById("addCampForm");
    const campName = document.getElementById("campName");
    const campOrganizer = document.getElementById("campOrganizer");
    const campDate = document.getElementById("campDate");
    const campTiming = document.getElementById("campTiming");
    const campVenue = document.getElementById("campVenue");
    const campTarget = document.getElementById("campTarget");
    const campsContainer = document.getElementById("campsContainer");
    const campsEmptyState = document.getElementById("campsEmptyState");

    const donorsTableBody = document.getElementById("donorsTableBody");
    const donorsEmptyState = document.getElementById("donorsEmptyState");
    const donorSearchInput = document.getElementById("donorSearchInput");
    const donorGroupFilter = document.getElementById("donorGroupFilter");
    const donorStatusFilter = document.getElementById("donorStatusFilter");

    const bloodSummaryGrid = document.getElementById("bloodSummaryGrid");
    const bloodRequestsList = document.getElementById("bloodRequestsList");
    const bloodRequestsEmptyState = document.getElementById("bloodRequestsEmptyState");
    const bloodRequestsEmptyMessage = document.getElementById("bloodRequestsEmptyMessage");
    const bloodRequestCount = document.getElementById("bloodRequestCount");
    let activeHospitalSession = null;

    function loadData(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch (e) {
            console.warn(`[Jeevan] Could not read ${key}`, e);
            return fallback;
        }
    }

    function saveData(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error(`[Jeevan] Could not save ${key}`, e);
            alert("Unable to save data. Browser storage may be full.");
            return false;
        }
    }

    function getFutureDate(days) {
        const d = new Date();
        d.setDate(d.getDate() + days);
        return d.toISOString().split("T")[0];
    }

    function getDaysDiff(dateStr) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(dateStr);
        target.setHours(0, 0, 0, 0);
        return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    }

    function escapeHTML(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    const todayISO = new Date().toISOString().split("T")[0];
    if (inventoryExpiry) inventoryExpiry.min = todayISO;
    if (campDate) campDate.min = todayISO;

    if (!localStorage.getItem(KEYS.INVENTORY)) saveData(KEYS.INVENTORY, DEFAULT_INVENTORY);
    if (!localStorage.getItem(KEYS.CAMPS)) saveData(KEYS.CAMPS, DEFAULT_CAMPS);
    if (!localStorage.getItem(KEYS.DONOR_STATUS)) saveData(KEYS.DONOR_STATUS, {});

    if (verificationForm) {
        verificationForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const rawId = governmentIdInput.value.trim().toUpperCase();

            if (rawId.length < 4 || !/^[A-Z0-9\-_]{4,20}$/.test(rawId)) {
                verificationResult.style.display = "block";
                verificationResult.className = "verification-status-card error";
                resultTitle.innerHTML = "❌ Verification Failed";
                resultMessage.innerHTML = "Please enter a valid Hospital ID (minimum 4 letters, numbers, or dashes; e.g. HOSP-101, PGI-CHD-102).";
                managementSection.style.display = "none";
                return;
            }

            const name = DEMO_HOSPITALS[rawId] || `${rawId} Blood Care & Transfusion Center`;
            const session = { verified: true, hospitalId: rawId, hospitalName: name, verifiedAt: new Date().toISOString() };
            saveData(KEYS.SESSION, session);

            verificationResult.style.display = "block";
            verificationResult.className = "verification-status-card success";
            resultTitle.innerHTML = "✅ Demo Verification Successful";
            resultMessage.innerHTML = `<strong>${escapeHTML(name)}</strong> verified for demonstration access.<br>ID: <code>${escapeHTML(rawId)}</code>.<br><span class="demo-disclaimer-pill">⚠️ Demo Mode Notice: This is a front-end simulation for portal demonstration. It is not an official government authority verification.</span>`;

            activateDashboard(session);
            managementSection.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    }

    function activateDashboard(session) {
        if (!managementSection) return;
        activeHospitalSession = session;
        if (displayHospitalName) displayHospitalName.textContent = session.hospitalName;
        if (displayHospitalId) displayHospitalId.textContent = `ID: ${session.hospitalId}`;
        managementSection.style.display = "block";
        refreshAll();
    }

    function refreshAll() {
        renderInventoryTable();
        renderCampsList();
        renderDonorsList();
        renderOverviewGrid();
        updateSummaryStats();
        renderBloodRequests();
    }

    if (exitHospitalBtn) {
        exitHospitalBtn.addEventListener("click", function () {
            if (confirm("Exit the current hospital demo session?")) {
                localStorage.removeItem(KEYS.SESSION);
                managementSection.style.display = "none";
                verificationResult.style.display = "none";
                governmentIdInput.value = "";
                governmentIdInput.focus();
                window.scrollTo({ top: 0, behavior: "smooth" });
            }
        });
    }

    if (resetDemoDataBtn) {
        resetDemoDataBtn.addEventListener("click", function () {
            if (confirm("Reset all inventory, camps, and donor data back to initial demo defaults?")) {
                saveData(KEYS.INVENTORY, DEFAULT_INVENTORY);
                saveData(KEYS.CAMPS, DEFAULT_CAMPS);
                saveData(KEYS.DONOR_STATUS, {});
                resetInventoryForm();
                refreshAll();
                alert("Demo data restored to defaults!");
            }
        });
    }

    const existingSession = loadData(KEYS.SESSION, null);
    if (existingSession && existingSession.verified) {
        if (governmentIdInput) governmentIdInput.value = existingSession.hospitalId;
        if (verificationResult) {
            verificationResult.style.display = "block";
            verificationResult.className = "verification-status-card success";
            resultTitle.innerHTML = "✅ Active Hospital Session";
            resultMessage.innerHTML = `Verified for demonstration access: <strong>${escapeHTML(existingSession.hospitalName)}</strong> (ID: <code>${escapeHTML(existingSession.hospitalId)}</code>).<br><span class="demo-disclaimer-pill">⚠️ Demo Mode Notice: Front-end demonstration simulation.</span>`;
        }
        activateDashboard(existingSession);
    }

    tabButtons.forEach(btn => {
        btn.addEventListener("click", function () {
            const tabId = this.getAttribute("data-tab");
            tabButtons.forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            tabContents.forEach(c => {
                c.classList.toggle("active", c.id === tabId);
            });

            if (tabId === "tab-overview") renderOverviewGrid();
            if (tabId === "tab-requests") renderBloodRequests();
        });
    });

    window.addEventListener("storage", function (event) {
        if (event.key === KEYS.REQUESTS) renderBloodRequests();
    });

    function renderBloodRequests() {
        if (!bloodRequestsList || !activeHospitalSession) return;

        const allRequests = loadData(KEYS.REQUESTS, []);
        const storedRequests = Array.isArray(allRequests) ? allRequests.filter(Boolean) : [];
        const requests = storedRequests.filter(request => request.hospitalId === activeHospitalSession.hospitalId);
        const otherHospitalIds = [...new Set(storedRequests
            .filter(request => request.hospitalId !== activeHospitalSession.hospitalId)
            .map(request => request.hospitalId)
            .filter(Boolean))];
        const newCount = requests.filter(request => request.status === "New").length;
        if (bloodRequestCount) bloodRequestCount.textContent = newCount;
        bloodRequestsList.replaceChildren();
        if (bloodRequestsEmptyState) bloodRequestsEmptyState.style.display = requests.length === 0 ? "block" : "none";
        if (bloodRequestsEmptyMessage) {
            bloodRequestsEmptyMessage.textContent = otherHospitalIds.length
                ? `No requests are addressed to ${activeHospitalSession.hospitalId}. This browser has requests for another hospital ID: ${otherHospitalIds.join(", ")}. A request must use this exact hospital ID to appear here.`
                : "Requests sent to this hospital from the same browser will appear here. Requests cannot sync across different browsers or devices without a shared server.";
        }

        requests.forEach(request => {
            const card = document.createElement("article");
            card.className = "blood-request-card";
            const donorPhone = request.donorPhone ? String(request.donorPhone) : "";
            const requesterPhone = request.requesterPhone ? String(request.requesterPhone) : "";
            const donorEmail = request.donorEmail ? String(request.donorEmail) : "";
            const requesterEmail = request.requesterEmail ? String(request.requesterEmail) : "";
            const donorPhoneLink = donorPhone
                ? `<a href="tel:${escapeHTML(donorPhone.replace(/[^\d+]/g, ""))}">${escapeHTML(donorPhone)}</a>`
                : "No donor phone saved; contact the requester for help.";
            const requesterPhoneLink = requesterPhone
                ? `<a href="tel:${escapeHTML(requesterPhone.replace(/[^\d+]/g, ""))}">${escapeHTML(requesterPhone)}</a>`
                : "Not provided";
            const nextStatus = {
                New: "Contacted",
                Contacted: "Connected",
                Connected: "Completed"
            }[request.status];
            const statusClass = {
                New: "scheduled",
                Contacted: "eligible",
                Connected: "available",
                Completed: "completed"
            }[request.status] || "scheduled";
            card.innerHTML = `
                <div class="blood-request-heading">
                    <div>
                        <h4>${escapeHTML(request.donorGroup || "Blood")} request from ${escapeHTML(request.requesterName || "requester")} for ${escapeHTML(request.donorName || "donor")}</h4>
                        <span class="status-pill ${statusClass}">${escapeHTML(request.status || "New")}</span>
                    </div>
                    <span class="blood-chip">${escapeHTML(request.donorGroup || "—")}</span>
                </div>
                <div class="blood-request-details">
                    <p><strong>Patient:</strong> ${escapeHTML(request.patientName || request.requesterName || "Not provided")}</p>
                    <p><strong>Requester:</strong> ${escapeHTML(request.requesterName || "Not provided")}</p>
                    <p><strong>Call requester:</strong> ${requesterPhoneLink}</p>
                    ${requesterEmail ? `<p><strong>Requester email:</strong> <a href="mailto:${escapeHTML(requesterEmail)}">${escapeHTML(requesterEmail)}</a></p>` : ""}
                    <p><strong>Requester city:</strong> ${escapeHTML(request.requesterCity || "Not specified")}</p>
                    <p><strong>Donor:</strong> ${escapeHTML(request.donorName || "Not provided")} (${escapeHTML(request.donorGroup || "—")})</p>
                    <p><strong>Contact donor:</strong> ${donorPhoneLink}</p>
                    ${donorEmail ? `<p><strong>Donor email:</strong> <a href="mailto:${escapeHTML(donorEmail)}">${escapeHTML(donorEmail)}</a></p>` : ""}
                    <p><strong>Units needed:</strong> ${Number(request.units) || 1}</p>
                    <p><strong>Needed by:</strong> ${escapeHTML(request.neededBy || "Not specified")}</p>
                    <p><strong>Donor location:</strong> ${escapeHTML(request.donorCity || "Not specified")}</p>
                    ${request.details ? `<p><strong>Details:</strong> ${escapeHTML(request.details)}</p>` : ""}
                </div>
                ${nextStatus ? `<button type="button" class="action-btn success" data-action="update-request-status" data-status="${nextStatus}" data-id="${escapeHTML(request.id)}">Mark as ${nextStatus.toLowerCase()}</button>` : ""}
            `;
            bloodRequestsList.appendChild(card);
        });
    }

    if (bloodRequestsList) {
        bloodRequestsList.addEventListener("click", function (event) {
            const button = event.target.closest("button[data-action='update-request-status']");
            if (!button) return;

            const requests = loadData(KEYS.REQUESTS, []);
            if (!Array.isArray(requests)) {
                console.error("[Jeevan] Saved blood requests are not a list.");
                return;
            }
            const request = requests.find(item => item.id === button.getAttribute("data-id"));
            if (!request || request.hospitalId !== activeHospitalSession.hospitalId) return;
            const allowedStatuses = {
                New: "Contacted",
                Contacted: "Connected",
                Connected: "Completed"
            };
            const nextStatus = allowedStatuses[request.status];
            if (nextStatus !== button.getAttribute("data-status")) return;
            request.status = nextStatus;
            request.statusUpdatedAt = new Date().toISOString();
            if (saveData(KEYS.REQUESTS, requests)) renderBloodRequests();
        });
    }

    function renderInventoryTable() {
        if (!inventoryTableBody) return;
        const inventory = loadData(KEYS.INVENTORY, []);
        const groupFilter = filterBloodGroup ? filterBloodGroup.value : "";
        const statusFilter = filterStockStatus ? filterStockStatus.value : "";

        const filtered = inventory.filter(item => {
            const matchesGroup = !groupFilter || item.bloodGroup === groupFilter;
            const daysLeft = getDaysDiff(item.expiry);
            let matchesStatus = true;

            if (statusFilter === "available") matchesStatus = daysLeft > 0 && item.units >= 5;
            else if (statusFilter === "low") matchesStatus = daysLeft > 0 && item.units < 5;
            else if (statusFilter === "expired") matchesStatus = daysLeft <= 0;

            return matchesGroup && matchesStatus;
        });

        inventoryTableBody.innerHTML = "";
        if (inventoryEmptyState) inventoryEmptyState.style.display = filtered.length === 0 ? "block" : "none";

        filtered.forEach(item => {
            const daysLeft = getDaysDiff(item.expiry);
            let statusPill;

            if (daysLeft < 0) statusPill = `<span class="status-pill expired">⚠️ Expired (${Math.abs(daysLeft)}d ago)</span>`;
            else if (daysLeft <= 7) statusPill = `<span class="status-pill expired">⏳ Expiring (${daysLeft}d)</span>`;
            else if (item.units < 5) statusPill = `<span class="status-pill low">⚠️ Low (${item.units} left)</span>`;
            else statusPill = `<span class="status-pill available">● In Stock (${daysLeft}d left)</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><span class="blood-chip">${escapeHTML(item.bloodGroup)}</span></td>
                <td><strong>${escapeHTML(item.component)}</strong></td>
                <td><span style="font-size: 15px; font-weight: 700; color: #111827;">${Number(item.units)}</span> units</td>
                <td>${escapeHTML(item.expiry)}</td>
                <td>${escapeHTML(item.location || "General Storage")}</td>
                <td>${statusPill}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="action-btn edit" data-action="edit-inv" data-id="${escapeHTML(item.id)}">✏️ Edit</button>
                        <button type="button" class="action-btn delete" data-action="delete-inv" data-id="${escapeHTML(item.id)}">🗑️ Delete</button>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(tr);
        });
    }

    if (inventoryTableBody) {
        inventoryTableBody.addEventListener("click", function (e) {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;
            const action = btn.getAttribute("data-action");
            const id = btn.getAttribute("data-id");

            if (action === "edit-inv") startEditInventory(id);
            else if (action === "delete-inv") deleteInventoryItem(id);
        });
    }

    function startEditInventory(id) {
        const item = loadData(KEYS.INVENTORY, []).find(i => i.id === id);
        if (!item) return;

        editInventoryId.value = item.id;
        inventoryBloodGroup.value = item.bloodGroup;
        inventoryComponent.value = item.component;
        inventoryUnits.value = item.units;
        inventoryExpiry.value = item.expiry;
        inventoryLocation.value = item.location || "";

        inventoryFormHeading.textContent = "✏️ Edit Blood Stock Batch";
        saveInventoryBtn.textContent = "Update Blood Stock";
        inventoryEditBanner.style.display = "flex";
        addInventoryForm.scrollIntoView({ behavior: "smooth", block: "center" });
        inventoryUnits.focus();
    }

    function resetInventoryForm() {
        if (!addInventoryForm) return;
        addInventoryForm.reset();
        editInventoryId.value = "";
        inventoryFormHeading.textContent = "➕ Add Blood Stock Batch";
        saveInventoryBtn.textContent = "Save Blood Stock";
        inventoryEditBanner.style.display = "none";
    }

    if (cancelEditBtn) cancelEditBtn.addEventListener("click", resetInventoryForm);

    function deleteInventoryItem(id) {
        const inventory = loadData(KEYS.INVENTORY, []);
        const item = inventory.find(i => i.id === id);
        if (!item) return;

        if (confirm(`Delete ${item.bloodGroup} (${item.component}) batch of ${item.units} units?`)) {
            saveData(KEYS.INVENTORY, inventory.filter(i => i.id !== id));
            if (editInventoryId.value === id) resetInventoryForm();
            refreshAll();
        }
    }

    if (addInventoryForm) {
        addInventoryForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const group = inventoryBloodGroup.value;
            const comp = inventoryComponent.value;
            const units = parseInt(inventoryUnits.value, 10);
            const expiry = inventoryExpiry.value;
            const loc = inventoryLocation.value.trim();
            const editId = editInventoryId.value;

            if (!group || !comp || isNaN(units) || !expiry) {
                alert("Please fill all required inventory fields.");
                return;
            }
            if (units <= 0 || units > 1000) {
                alert("Quantity must be between 1 and 1000 units.");
                inventoryUnits.focus();
                return;
            }

            const inventory = loadData(KEYS.INVENTORY, []);
            if (editId) {
                const idx = inventory.findIndex(i => i.id === editId);
                if (idx !== -1) {
                    inventory[idx] = { id: editId, bloodGroup: group, component: comp, units, expiry, location: loc || "Cold Storage 1" };
                }
            } else {
                inventory.unshift({ id: "inv_" + Date.now(), bloodGroup: group, component: comp, units, expiry, location: loc || "Cold Storage 1" });
            }

            saveData(KEYS.INVENTORY, inventory);
            resetInventoryForm();
            refreshAll();
            alert(editId ? "Stock batch updated!" : "New stock batch added!");
        });
    }

    if (filterBloodGroup) filterBloodGroup.addEventListener("change", renderInventoryTable);
    if (filterStockStatus) filterStockStatus.addEventListener("change", renderInventoryTable);

    function renderCampsList() {
        if (!campsContainer) return;
        const camps = loadData(KEYS.CAMPS, []);
        campsContainer.innerHTML = "";
        if (campsEmptyState) campsEmptyState.style.display = camps.length === 0 ? "block" : "none";

        camps.forEach(camp => {
            const daysLeft = getDaysDiff(camp.date);
            const statusText = daysLeft < 0 ? "Completed" : daysLeft === 0 ? "Today!" : (camp.status || "Scheduled");
            const statusClass = daysLeft < 0 ? "completed" : daysLeft === 0 ? "available" : "scheduled";

            const card = document.createElement("div");
            card.className = "camp-item-card";
            card.innerHTML = `
                <div>
                    <div class="camp-header">
                        <h4>${escapeHTML(camp.name)}</h4>
                        <span class="status-pill ${statusClass}">${escapeHTML(statusText)}</span>
                    </div>
                    <div class="camp-details-list">
                        <p>🏢 Organizer: <span>${escapeHTML(camp.organizer)}</span></p>
                        <p>📅 Date: <span>${escapeHTML(camp.date)}</span> (${daysLeft >= 0 ? `${daysLeft} days away` : "Past event"})</p>
                        <p>⏰ Timing: <span>${escapeHTML(camp.timing)}</span></p>
                        <p>📍 Venue: <span>${escapeHTML(camp.venue)}</span></p>
                        <p>🎯 Target: <span>${Number(camp.target)} Bags</span></p>
                    </div>
                </div>
                <div style="text-align: right; border-top: 1px solid #f3f4f6; padding-top: 12px;">
                    <button type="button" class="action-btn delete" data-action="delete-camp" data-id="${escapeHTML(camp.id)}">
                        🗑️ Cancel / Delete Camp
                    </button>
                </div>
            `;
            campsContainer.appendChild(card);
        });
    }

    if (campsContainer) {
        campsContainer.addEventListener("click", function (e) {
            const btn = e.target.closest("button[data-action='delete-camp']");
            if (!btn) return;
            const id = btn.getAttribute("data-id");
            const camps = loadData(KEYS.CAMPS, []);
            const camp = camps.find(c => c.id === id);
            if (camp && confirm(`Cancel camp "${camp.name}" on ${camp.date}?`)) {
                saveData(KEYS.CAMPS, camps.filter(c => c.id !== id));
                renderCampsList();
                updateSummaryStats();
            }
        });
    }

    if (addCampForm) {
        addCampForm.addEventListener("submit", function (e) {
            e.preventDefault();
            const name = campName.value.trim();
            const organizer = campOrganizer.value.trim();
            const date = campDate.value;
            const timing = campTiming.value.trim();
            const venue = campVenue.value.trim();
            const target = parseInt(campTarget.value, 10);

            if (!name || !organizer || !date || !timing || !venue || isNaN(target)) {
                alert("Please fill all required donation camp fields.");
                return;
            }
            if (target < 5 || target > 2000) {
                alert("Target units must be between 5 and 2000 bags.");
                campTarget.focus();
                return;
            }

            const camps = loadData(KEYS.CAMPS, []);
            camps.unshift({ id: "camp_" + Date.now(), name, organizer, date, timing, venue, target, status: "Scheduled" });
            saveData(KEYS.CAMPS, camps);

            addCampForm.reset();
            renderCampsList();
            updateSummaryStats();
            alert("Donation camp scheduled successfully!");
        });
    }

    function getAggregatedDonors() {
        const storedUsers = loadData(KEYS.USERS, []);
        const registered = storedUsers
            .filter(u => u && u.role === "donor")
            .map(u => ({
                name: u.name || "Anonymous Donor",
                group: u.bloodGroup || "O+",
                email: u.email || "",
                phone: u.phone || "Not provided",
                city: u.city || "Not provided",
                lastDonation: "Never Donated"
            }));

        const currentRecords = loadData("jeevanDonors", []);
        const legacyRecords = loadData("donors", []);
        const donorRecords = (Array.isArray(currentRecords) ? currentRecords : [])
            .concat(Array.isArray(legacyRecords) ? legacyRecords : []);
        const combined = [...registered];
        donorRecords.forEach(donor => {
            const group = donor && (donor.group || donor.bloodGroup);
            if (!donor || !donor.name || !group) return;
            const duplicate = combined.some(d => d.name.toLowerCase() === donor.name.toLowerCase() ||
                (d.email && donor.email && d.email.toLowerCase() === donor.email.toLowerCase()));
            if (!duplicate) {
                combined.push({
                    name: donor.name,
                    group,
                    email: donor.email || "",
                    phone: donor.phone || "Not provided",
                    city: donor.city || "Not provided",
                    lastDonation: "Never Donated",
                    isDemo: donor.isDemo === true
                });
            }
        });

        const statuses = loadData(KEYS.DONOR_STATUS, {});
        return combined.map(d => {
            const key = d.name.trim().toLowerCase();
            return statuses[key] ? { ...d, ...statuses[key] } : { ...d, status: d.status || "Eligible" };
        });
    }

    function renderDonorsList() {
        if (!donorsTableBody) return;
        const donors = getAggregatedDonors();
        const query = donorSearchInput ? donorSearchInput.value.trim().toLowerCase() : "";
        const groupFilter = donorGroupFilter ? donorGroupFilter.value : "";
        const statusFilter = donorStatusFilter ? donorStatusFilter.value : "";

        const filtered = donors.filter(d => {
            const matchesSearch = !query || d.name.toLowerCase().includes(query) || d.group.toLowerCase().includes(query) || d.phone.includes(query);
            const matchesGroup = !groupFilter || d.group === groupFilter;
            const matchesStatus = !statusFilter || d.status === statusFilter;
            return matchesSearch && matchesGroup && matchesStatus;
        });

        donorsTableBody.innerHTML = "";
        if (donorsEmptyState) donorsEmptyState.style.display = filtered.length === 0 ? "block" : "none";

        filtered.forEach(d => {
            const isEligible = d.status === "Eligible";
            const isResting = d.status === "Donated (Resting)";
            const statusPill = isEligible ? `<span class="status-pill eligible">✓ Eligible</span>`
                : isResting ? `<span class="status-pill resting">⏳ Donated (Resting)</span>`
                : `<span class="status-pill deferred">⚠️ Deferred</span>`;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${escapeHTML(d.name)}</strong>${d.isDemo ? '<br><small class="demo-disclaimer-pill">Demo only</small>' : ""}</td>
                <td><span class="blood-chip">${escapeHTML(d.group)}</span></td>
                <td>${escapeHTML(d.phone)} <br><small style="color:#6b7280;">${escapeHTML(d.city)}</small></td>
                <td>${escapeHTML(d.lastDonation || "None recorded")}</td>
                <td>${statusPill}</td>
                <td>
                    <div class="table-actions">
                        <button type="button" class="action-btn success" data-action="log-donation" data-name="${escapeHTML(d.name)}" data-group="${escapeHTML(d.group)}">
                            🩸 Mark Donated Today
                        </button>
                        <button type="button" class="action-btn edit" data-action="toggle-status" data-name="${escapeHTML(d.name)}" data-current="${escapeHTML(d.status)}">
                            🔄 Change Status
                        </button>
                    </div>
                </td>
            `;
            donorsTableBody.appendChild(tr);
        });
    }

    if (donorsTableBody) {
        donorsTableBody.addEventListener("click", function (e) {
            const btn = e.target.closest("button[data-action]");
            if (!btn) return;
            const action = btn.getAttribute("data-action");
            const name = btn.getAttribute("data-name");

            if (action === "log-donation") {
                const group = btn.getAttribute("data-group");
                if (confirm(`Record a completed blood donation for ${name} (${group}) today?\nThis sets their status to 'Donated (Resting)' for 90 days.`)) {
                    const statuses = loadData(KEYS.DONOR_STATUS, {});
                    statuses[name.trim().toLowerCase()] = { status: "Donated (Resting)", lastDonation: todayISO };
                    saveData(KEYS.DONOR_STATUS, statuses);

                    if (confirm(`Add 1 collected unit of ${group} (Whole Blood) directly to blood inventory?`)) {
                        const inv = loadData(KEYS.INVENTORY, []);
                        inv.unshift({ id: "inv_" + Date.now(), bloodGroup: group, component: "Whole Blood", units: 1, expiry: getFutureDate(35), location: "Fresh Collection Intake" });
                        saveData(KEYS.INVENTORY, inv);
                        renderInventoryTable();
                        renderOverviewGrid();
                    }

                    renderDonorsList();
                    updateSummaryStats();
                    alert(`Donation recorded for ${name}!`);
                }
            } else if (action === "toggle-status") {
                const curr = btn.getAttribute("data-current");
                const nextStatus = curr === "Eligible" ? "Donated (Resting)" : curr === "Donated (Resting)" ? "Deferred" : "Eligible";
                const statuses = loadData(KEYS.DONOR_STATUS, {});
                const key = name.trim().toLowerCase();
                statuses[key] = { ...(statuses[key] || {}), status: nextStatus };
                saveData(KEYS.DONOR_STATUS, statuses);
                renderDonorsList();
            }
        });
    }

    if (donorSearchInput) donorSearchInput.addEventListener("input", renderDonorsList);
    if (donorGroupFilter) donorGroupFilter.addEventListener("change", renderDonorsList);
    if (donorStatusFilter) donorStatusFilter.addEventListener("change", renderDonorsList);

    function renderOverviewGrid() {
        if (!bloodSummaryGrid) return;
        const inventory = loadData(KEYS.INVENTORY, []);
        const tallies = {};
        ALL_GROUPS.forEach(g => { tallies[g] = 0; });

        inventory.forEach(item => {
            if (getDaysDiff(item.expiry) >= 0 && tallies[item.bloodGroup] !== undefined) {
                tallies[item.bloodGroup] += Number(item.units) || 0;
            }
        });

        bloodSummaryGrid.innerHTML = "";
        ALL_GROUPS.forEach(group => {
            const units = tallies[group] || 0;
            const isCritical = units < 5;
            const card = document.createElement("div");
            card.className = `blood-summary-card ${isCritical ? "critical-stock" : ""}`;
            card.innerHTML = `
                <div class="blood-summary-group">${escapeHTML(group)}</div>
                <div class="blood-summary-units" style="${isCritical ? "color: #b91c1c;" : ""}">${units}</div>
                <div class="blood-summary-label">${isCritical ? "⚠️ Critical / Low Stock" : "Units Available"}</div>
            `;
            bloodSummaryGrid.appendChild(card);
        });
    }

    function updateSummaryStats() {
        const inventory = loadData(KEYS.INVENTORY, []);
        const camps = loadData(KEYS.CAMPS, []);
        const donors = getAggregatedDonors();

        let total = 0;
        let lowOrExpiring = 0;

        inventory.forEach(item => {
            const units = Number(item.units) || 0;
            const daysLeft = getDaysDiff(item.expiry);
            if (daysLeft >= 0) total += units;
            if (daysLeft <= 7 || units < 5) lowOrExpiring++;
        });

        if (statTotalUnits) statTotalUnits.textContent = total;
        if (statLowStock) statLowStock.textContent = lowOrExpiring;
        if (statActiveCamps) statActiveCamps.textContent = camps.filter(c => getDaysDiff(c.date) >= 0).length;
        if (statActiveDonors) statActiveDonors.textContent = donors.length;
    }
});