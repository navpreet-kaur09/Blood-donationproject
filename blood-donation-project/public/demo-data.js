(function () {
    "use strict";

    const hospitals = {
        "HOSP-101": "GMCH-32 Demo Hospital",
        "PGI-CHD-102": "PGIMER Chandigarh Demo",
        "AIIMS-DEL-01": "AIIMS Delhi Demo Hospital",
        "GOV-HOSP-2024": "District Civil Hospital Mohali Demo",
        "JEEVAN-CHD-01": "Jeevan Demo Blood Bank Chandigarh",
        "JEEVAN-MOH-02": "Jeevan Demo Blood Bank Mohali",
        "JEEVAN-LDH-03": "Jeevan Demo Blood Bank Ludhiana"
    };

    const donors = [
        { id: "demo-donor-1", name: "Aanya Demo", group: "A+", city: "Chandigarh" },
        { id: "demo-donor-2", name: "Kabir Demo", group: "O+", city: "Mohali" },
        { id: "demo-donor-3", name: "Meera Demo", group: "B+", city: "Panchkula" },
        { id: "demo-donor-4", name: "Arjun Demo", group: "AB-", city: "Chandigarh" },
        { id: "demo-donor-5", name: "Simran Demo", group: "O-", city: "Ludhiana" },
        { id: "demo-donor-6", name: "Ishaan Demo", group: "A-", city: "Amritsar" },
        { id: "demo-donor-7", name: "Riya Demo", group: "B-", city: "Patiala" },
        { id: "demo-donor-8", name: "Dev Demo", group: "AB+", city: "Jalandhar" }
    ].map(function (donor) {
        return { ...donor, phone: "", email: "", age: 22, available: true, isDemo: true };
    });

    window.JeevanDemoData = { hospitals, donors };

    try {
        const saved = localStorage.getItem("jeevanDonors");
        const registeredDonors = saved ? JSON.parse(saved) : [];
        if (!Array.isArray(registeredDonors)) {
            throw new Error("Saved donor data must be a list.");
        }

        const existingIds = new Set(registeredDonors.map(function (donor) {
            return donor && donor.id;
        }));
        const seededDonors = donors.filter(function (donor) {
            return !existingIds.has(donor.id);
        });
        if (seededDonors.length) {
            localStorage.setItem("jeevanDonors", JSON.stringify(registeredDonors.concat(seededDonors)));
        }
    } catch (error) {
        console.error("[Jeevan] Could not load demo donor data.", error);
    }
})();
