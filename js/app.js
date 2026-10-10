
/* =========================================================
   WIANG CHAI E-DOCUMENT — APPLICATION JAVASCRIPT
   Replacement version: login, navigation, incoming dispatches,
   incoming-document registration, and search.
========================================================= */

(() => {
    "use strict";

    const SUPABASE_URL = "https://oplchatspdhzriljmlid.supabase.co";
    const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Y0EpLZUgaSV89F73i1Y86Q_kGokgZc4";

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
        console.error("ไม่พบ Supabase SDK กรุณาตรวจสอบสคริปต์ Supabase ใน index.html");
        return;
    }

    const supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const state = {
        session: null,
        activePage: "dashboard",
        incomingDocuments: [],
        dispatches: [],
        loadingDispatches: false,
        loadingIncoming: false
    };

    document.addEventListener("DOMContentLoaded", init);

    async function init() {
        console.info("Wiang Chai E-Document: เริ่มต้นระบบ");
        updateThaiDate();
        setupSidebar();
        setupNavigation();
        setupSearch();
        setupLogin();
        setupLogout();
        setupIncomingRegistration();
        setupDispatchRefresh();

        const { data, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("ตรวจสอบ Session ไม่สำเร็จ:", error.message);
            showLogin(true);
        } else {
            state.session = data.session;
            showLogin(!state.session);

            if (state.session) {
                await afterLogin();
            }
        }

        supabaseClient.auth.onAuthStateChange((event, session) => {
            state.session = session;
            showLogin(!session);

            if (event === "SIGNED_IN" && session) {
                window.setTimeout(() => afterLogin(), 0);
            }

            if (event === "SIGNED_OUT") {
                state.incomingDocuments = [];
                state.dispatches = [];
                renderIncomingDocuments();
                renderDispatches();
                showDashboard();
            }
        });
    }

    function updateThaiDate() {
        const element = $("#currentDate");
        if (!element) return;

        element.textContent = new Intl.DateTimeFormat("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: "Asia/Bangkok"
        }).format(new Date());
    }

    function setupSidebar() {
        const sidebar = $("#sidebar");
        const overlay = $("#sidebarOverlay");
        const menuButton = $("#mobileMenuBtn");

        const closeSidebar = () => {
            sidebar?.classList.remove("open");
            overlay?.classList.remove("active");
        };

        menuButton?.addEventListener("click", () => {
            sidebar?.classList.add("open");
            overlay?.classList.add("active");
        });

        overlay?.addEventListener("click", closeSidebar);

        window.addEventListener("resize", () => {
            if (window.innerWidth > 1050) closeSidebar();
        });
    }

    function setupNavigation() {
        $$(".nav-item").forEach((item) => {
            item.addEventListener("click", (event) => {
                event.preventDefault();
                const label = item.textContent.trim();

                if (label.includes("หน้าหลัก")) {
                    showDashboard();
                } else if (label.includes("หนังสือรับ")) {
                    showIncomingPage(false);
                } else {
                    showNotReady(label);
                }

                $$(".nav-item").forEach((nav) => {
                    nav.classList.toggle("active", nav === item);
                });

                closeMobileSidebar();
            });
        });

        $$(".quick-card").forEach((card) => {
            card.addEventListener("click", (event) => {
                event.preventDefault();

                const page = card.dataset.page || "";

                if (
                    page === "receive" ||
                    card.textContent.includes("ลงทะเบียนหนังสือรับ")
                ) {
                    showIncomingPage(true);
                } else {
                    showNotReady(card.textContent.trim());
                }
            });
        });

        $$(".system-card").forEach((card) => {
            card.addEventListener("click", (event) => {
                event.preventDefault();
                const label = card.textContent.trim();

                if (label.includes("หนังสือรับ")) {
                    showIncomingPage(false);
                } else {
                    showNotReady(label);
                }
            });
        });

        $("#newIncomingDocumentBtn")?.addEventListener("click", () => {
            showIncomingPage(true);
        });

        $("#cancelIncomingDocumentBtn")?.addEventListener(
            "click",
            hideIncomingForm
        );
    }

    function closeMobileSidebar() {
        if (window.innerWidth <= 1050) {
            $("#sidebar")?.classList.remove("open");
            $("#sidebarOverlay")?.classList.remove("active");
        }
    }

    function showDashboard() {
        state.activePage = "dashboard";

        const receivePage = $("#receivePage");
        if (receivePage) receivePage.hidden = true;

        getDashboardSections().forEach((section) => {
            section.hidden = false;
        });
    }

    function showIncomingPage(openForm) {
        if (!requireSession()) return;

        state.activePage = "receive";

        getDashboardSections().forEach((section) => {
            section.hidden = true;
        });

        const receivePage = $("#receivePage");
        if (receivePage) receivePage.hidden = false;

        const message = $("#receivePageMessage");
        if (message) message.textContent = "ระบบหนังสือรับพร้อมใช้งาน";

        if (openForm) {
            showIncomingForm();
        } else {
            hideIncomingForm();
        }

        loadIncomingDocuments();
    }

    function getDashboardSections() {
        const content = $(".content");
        if (!content) return [];

        return Array.from(content.children).filter(
            (element) => element.id !== "receivePage"
        );
    }

    function showNotReady(label) {
        window.alert(`เมนู “${label}” ยังไม่ได้เชื่อมต่อกับหน้าระบบจริง`);
    }

    function showIncomingForm() {
        const container = $("#incomingRegistrationFormContainer");
        if (container) container.hidden = false;

        const form = $("#incomingRegistrationForm");
        const dateInput = form?.elements.namedItem("received_date");

        if (dateInput && !dateInput.value) {
            dateInput.value = localDateInputValue();
        }

        form?.elements.namedItem("subject")?.focus();
    }

    function hideIncomingForm() {
        const container = $("#incomingRegistrationFormContainer");
        if (container) container.hidden = true;

        const message = $("#incomingRegistrationMessage");

        if (message) {
            message.textContent = "";
            message.className = "";
        }
    }

    function localDateInputValue() {
        const now = new Date();
        const local = new Date(
            now.getTime() - now.getTimezoneOffset() * 60000
        );

        return local.toISOString().slice(0, 10);
    }

    function setupLogin() {
        const form = $("#loginForm");
        const emailInput = $("#loginEmail");
        const passwordInput = $("#loginPassword");
        const button = $("#loginButton");
        const message = $("#loginMessage");

        if (!form || !emailInput || !passwordInput || !button || !message) {
            console.error("ไม่พบองค์ประกอบหน้า Login ครบถ้วน");
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                setMessage(message, "กรุณากรอกอีเมลและรหัสผ่าน", "error");
                return;
            }

            button.disabled = true;
            button.textContent = "กำลังเข้าสู่ระบบ...";
            setMessage(message, "", "");

            try {
                const { error } = await supabaseClient.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;

                passwordInput.value = "";
                setMessage(message, "เข้าสู่ระบบสำเร็จ", "success");
            } catch (error) {
                console.error("Login error:", error);
                passwordInput.value = "";

                setMessage(
                    message,
                    "เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบอีเมลและรหัสผ่าน",
                    "error"
                );

                passwordInput.focus();
            } finally {
                button.disabled = false;
                button.textContent = "เข้าสู่ระบบ";
            }
        });
    }

    function setupLogout() {
        $("#logoutBtn")?.addEventListener("click", async () => {
            if (!window.confirm("ต้องการออกจากระบบหรือไม่?")) return;

            const button = $("#logoutBtn");
            if (button) button.disabled = true;

            try {
                const { error } = await supabaseClient.auth.signOut();
                if (error) throw error;
            } catch (error) {
                console.error("Logout error:", error);
                window.alert("ออกจากระบบไม่สำเร็จ กรุณาลองใหม่");
            } finally {
                if (button) button.disabled = false;
            }
        });
    }

    function showLogin(show) {
        const loginScreen = $("#loginScreen");
        if (loginScreen) {
            loginScreen.style.display = show ? "flex" : "none";
        }
    }

    async function afterLogin() {
        showLogin(false);
        await Promise.all([
            loadDispatches(),
            loadIncomingDocuments()
        ]);
    }

    function requireSession() {
        if (state.session) return true;

        setMessage(
            $("#receivePageMessage"),
            "กรุณาเข้าสู่ระบบก่อนใช้งานหนังสือรับ",
            "error"
        );

        showLogin(true);
        return false;
    }

    function setupDispatchRefresh() {
        $("#refreshIncomingBtn")?.addEventListener("click", () => {
            loadDispatches(true);
        });
    }

    async function loadDispatches(showLoading = false) {
        const tbody = $("#incomingDocumentsBody");
        const message = $("#incomingMessage");

        if (!tbody || !message) return;

        if (!state.session) {
            state.dispatches = [];
            message.textContent = "กรุณาเข้าสู่ระบบเพื่อดูหนังสือรอรับ";
            tbody.replaceChildren();

            appendTableMessage(
                tbody,
                5,
                "กรุณาเข้าสู่ระบบเพื่อดูรายการ"
            );

            return;
        }

        if (state.loadingDispatches) return;
        state.loadingDispatches = true;

        if (showLoading) {
            message.textContent = "กำลังโหลดรายการหนังสือ...";
        }

        try {
            const { data, error } = await supabaseClient.rpc(
                "get_incoming_document_dispatches"
            );

            if (error) throw error;

            state.dispatches = Array.isArray(data) ? data : [];
            renderDispatches();
        } catch (error) {
            console.error("โหลดหนังสือรอรับไม่สำเร็จ:", error);

            message.textContent =
                `โหลดรายการไม่สำเร็จ: ${error.message || "เกิดข้อผิดพลาด"}`;

            tbody.replaceChildren();

            appendTableMessage(
                tbody,
                5,
                "เกิดข้อผิดพลาดในการโหลดข้อมูล"
            );
        } finally {
            state.loadingDispatches = false;
        }
    }

    function renderDispatches() {
        const tbody = $("#incomingDocumentsBody");
        const message = $("#incomingMessage");

        if (!tbody || !message) return;

        tbody.replaceChildren();

        if (!state.session) {
            message.textContent = "กรุณาเข้าสู่ระบบเพื่อดูหนังสือรอรับ";

            appendTableMessage(
                tbody,
                5,
                "กรุณาเข้าสู่ระบบเพื่อดูรายการ"
            );

            return;
        }

        if (!state.dispatches.length) {
            message.textContent = "ไม่มีหนังสือรอรับในขณะนี้";
            appendTableMessage(tbody, 5, "ไม่พบรายการหนังสือที่รอรับ");
            return;
        }

        message.textContent =
            `พบหนังสือรอรับ ${state.dispatches.length} รายการ`;

        state.dispatches.forEach((doc) => {
            const row = document.createElement("tr");

            [
                doc.document_no,
                doc.subject,
                doc.sender_name,
                formatThaiDateTime(doc.dispatched_at),
                doc.status || "รอรับ"
            ].forEach((value) => appendCell(row, value || "-"));

            tbody.appendChild(row);
        });
    }

    function setupIncomingRegistration() {
        const form = $("#incomingRegistrationForm");

        if (!form) {
            console.warn("ไม่พบ #incomingRegistrationForm ใน index.html");
            return;
        }

        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            if (!requireSession()) return;

            const message = $("#incomingRegistrationMessage");
            const submitButton = $("button[type='submit']", form);
            const formData = new FormData(form);

            const payload = {
                subject: String(formData.get("subject") || "").trim(),
                sender_name: String(formData.get("sender_name") || "").trim(),
                received_date: String(formData.get("received_date") || ""),
                document_date:
                    String(formData.get("document_date") || "") || null,
                reference_no:
                    String(formData.get("reference_no") || "").trim() || null,
                notes: String(formData.get("notes") || "").trim() || null,
                created_by: state.session.user.id
            };

            if (
                !payload.subject ||
                !payload.sender_name ||
                !payload.received_date
            ) {
                setMessage(
                    message,
                    "กรุณากรอกเรื่อง ผู้ส่ง และวันที่รับหนังสือให้ครบ",
                    "error"
                );

                return;
            }

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = "กำลังบันทึก...";
            }

            setMessage(message, "", "");

            try {
                const { data, error } = await supabaseClient
                    .from("incoming_documents")
                    .insert(payload)
                    .select(
                        "id, register_no, subject, sender_name, received_date, document_date, reference_no, notes, created_at"
                    )
                    .single();

                if (error) throw error;

                setMessage(
                    message,
                    `บันทึกทะเบียนหนังสือรับสำเร็จ${
                        data?.register_no ? ` เลขรับ ${data.register_no}` : ""
                    }`,
                    "success"
                );

                form.reset();

                const dateInput = form.elements.namedItem("received_date");
                if (dateInput) dateInput.value = localDateInputValue();

                await loadIncomingDocuments();
            } catch (error) {
                console.error("บันทึกหนังสือรับไม่สำเร็จ:", error);

                const detail = error?.message || "เกิดข้อผิดพลาด";

                setMessage(
                    message,
                    `บันทึกไม่สำเร็จ: ${detail} (ตรวจสอบตาราง incoming_documents และสิทธิ์ RLS ใน Supabase)`,
                    "error"
                );
            } finally {
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "บันทึกทะเบียนหนังสือรับ";
                }
            }
        });
    }

    async function loadIncomingDocuments() {
        const tbody = $("#registeredIncomingDocumentsBody");
        const message = $("#receivePageMessage");

        if (!tbody) return;

        if (!state.session) {
            tbody.replaceChildren();

            appendTableMessage(
                tbody,
                4,
                "กรุณาเข้าสู่ระบบเพื่อดูทะเบียนหนังสือรับ"
            );

            if (message) {
                message.textContent = "กรุณาเข้าสู่ระบบก่อนดูทะเบียนหนังสือรับ";
            }

            return;
        }

        if (state.loadingIncoming) return;
        state.loadingIncoming = true;

        tbody.replaceChildren();
        appendTableMessage(tbody, 4, "กำลังโหลดทะเบียนหนังสือรับ...");

        try {
            const { data, error } = await supabaseClient
                .from("incoming_documents")
                .select(
                    "id, register_no, subject, sender_name, received_date, created_at"
                )
                .order("created_at", { ascending: false })
                .limit(200);

            if (error) throw error;

            state.incomingDocuments = Array.isArray(data) ? data : [];

            renderIncomingDocuments();

            if (message) {
                message.textContent =
                    `ทะเบียนหนังสือรับ ${state.incomingDocuments.length} รายการ`;
            }
        } catch (error) {
            console.error("โหลดทะเบียนหนังสือรับไม่สำเร็จ:", error);

            tbody.replaceChildren();

            appendTableMessage(
                tbody,
                4,
                "โหลดทะเบียนไม่สำเร็จ โปรดตรวจสอบตาราง incoming_documents และสิทธิ์ RLS"
            );

            if (message) {
                message.textContent =
                    `โหลดทะเบียนไม่สำเร็จ: ${error.message || "เกิดข้อผิดพลาด"}`;
            }
        } finally {
            state.loadingIncoming = false;
        }
    }

    function renderIncomingDocuments() {
        const tbody = $("#registeredIncomingDocumentsBody");
        if (!tbody) return;

        tbody.replaceChildren();

        if (!state.session) {
            appendTableMessage(
                tbody,
                4,
                "กรุณาเข้าสู่ระบบเพื่อดูทะเบียนหนังสือรับ"
            );

            return;
        }

        if (!state.incomingDocuments.length) {
            appendTableMessage(tbody, 4, "ยังไม่มีทะเบียนหนังสือรับ");
            return;
        }

        state.incomingDocuments.forEach((doc) => {
            const row = document.createElement("tr");

            appendCell(row, doc.register_no || "-");
            appendCell(row, doc.subject || "-");
            appendCell(row, doc.sender_name || "-");
            appendCell(row, formatThaiDate(doc.received_date));

            tbody.appendChild(row);
        });
    }

    function setupSearch() {
        const input = $(".search-box input");
        if (!input) return;

        input.addEventListener("keydown", (event) => {
            if (event.key !== "Enter") return;

            const keyword = input.value.trim().toLocaleLowerCase("th-TH");

            if (!keyword) {
                renderDispatches();
                renderIncomingDocuments();
                return;
            }

            const filteredDispatches = state.dispatches.filter((doc) =>
                [
                    doc.document_no,
                    doc.subject,
                    doc.sender_name,
                    doc.status
                ].some((value) =>
                    String(value || "")
                        .toLocaleLowerCase("th-TH")
                        .includes(keyword)
                )
            );

            const dispatchBody = $("#incomingDocumentsBody");
            const dispatchMessage = $("#incomingMessage");

            if (dispatchBody && dispatchMessage) {
                dispatchBody.replaceChildren();

                filteredDispatches.forEach((doc) => {
                    const row = document.createElement("tr");

                    [
                        doc.document_no,
                        doc.subject,
                        doc.sender_name,
                        formatThaiDateTime(doc.dispatched_at),
                        doc.status || "รอรับ"
                    ].forEach((value) => appendCell(row, value || "-"));

                    dispatchBody.appendChild(row);
                });

                dispatchMessage.textContent =
                    `ผลค้นหาหนังสือรอรับ ${filteredDispatches.length} รายการ`;

                if (!filteredDispatches.length) {
                    appendTableMessage(
                        dispatchBody,
                        5,
                        "ไม่พบรายการที่ตรงกับคำค้น"
                    );
                }
            }

            const filteredIncoming = state.incomingDocuments.filter((doc) =>
                [doc.register_no, doc.subject, doc.sender_name].some((value) =>
                    String(value || "")
                        .toLocaleLowerCase("th-TH")
                        .includes(keyword)
                )
            );

            const incomingBody = $("#registeredIncomingDocumentsBody");

            if (incomingBody) {
                incomingBody.replaceChildren();

                filteredIncoming.forEach((doc) => {
                    const row = document.createElement("tr");

                    [
                        doc.register_no || "-",
                        doc.subject || "-",
                        doc.sender_name || "-",
                        formatThaiDate(doc.received_date)
                    ].forEach((value) => appendCell(row, value));

                    incomingBody.appendChild(row);
                });

                if (!filteredIncoming.length) {
                    appendTableMessage(
                        incomingBody,
                        4,
                        "ไม่พบรายการที่ตรงกับคำค้น"
                    );
                }
            }
        });
    }

    function setMessage(element, text, type) {
        if (!element) return;

        element.textContent = text;
        element.classList.remove("error", "success");

        if (type === "error" || type === "success") {
            element.classList.add(type);
        }
    }

    function appendTableMessage(tbody, colspan, text) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = colspan;
        cell.style.padding = "16px";
        cell.textContent = text;

        row.appendChild(cell);
        tbody.appendChild(row);
    }

    function appendCell(row, value) {
        const cell = document.createElement("td");

        cell.style.padding = "12px";
        cell.style.borderTop = "1px solid #e5e7eb";
        cell.textContent = String(value ?? "-");

        row.appendChild(cell);
    }

    function formatThaiDateTime(value) {
        if (!value) return "-";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "-";

        return new Intl.DateTimeFormat("th-TH", {
            dateStyle: "medium",
            timeStyle: "short",
            timeZone: "Asia/Bangkok"
        }).format(date);
    }

    function formatThaiDate(value) {
        if (!value) return "-";

        const date = new Date(`${value}T00:00:00+07:00`);
        if (Number.isNaN(date.getTime())) return String(value);

        return new Intl.DateTimeFormat("th-TH", {
            day: "numeric",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Bangkok"
        }).format(date);
    }
})();
