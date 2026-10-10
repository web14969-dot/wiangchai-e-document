/* =========================================================
   WIANG CHAI E-DOCUMENT
   APPLICATION JAVASCRIPT
   2026
========================================================= */


/* =========================================================
   SUPABASE CONNECTION
   WIANG CHAI E-DOCUMENT
========================================================= */

const SUPABASE_URL =
    "https://oplchatspdhzriljmlid.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_Y0EpLZUgaSV89F73i1Y86Q_kGokgZc4";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

console.log(
    "Supabase client connected:",
    !!supabaseClient
);


/* =========================================================
   APPLICATION START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "ระบบงานสารบรรณอิเล็กทรอนิกส์โหลดเรียบร้อย"
        );


        /* =====================================================
           CURRENT DATE
        ===================================================== */

        const dateElement =
            document.getElementById("currentDate");


        if (dateElement) {

            const now = new Date();

            const thaiMonths = [
                "มกราคม",
                "กุมภาพันธ์",
                "มีนาคม",
                "เมษายน",
                "พฤษภาคม",
                "มิถุนายน",
                "กรกฎาคม",
                "สิงหาคม",
                "กันยายน",
                "ตุลาคม",
                "พฤศจิกายน",
                "ธันวาคม"
            ];


            const day =
                now.getDate();

            const month =
                thaiMonths[now.getMonth()];

            const year =
                now.getFullYear() + 543;


            dateElement.textContent =
                `${day} ${month} ${year}`;
        }



        /* =====================================================
           SIDEBAR
        ===================================================== */

        const sidebar =
            document.getElementById("sidebar");

        const mobileMenuBtn =
            document.getElementById("mobileMenuBtn");

        const sidebarOverlay =
            document.getElementById("sidebarOverlay");


        function openSidebar() {

            if (!sidebar) {
                return;
            }


            sidebar.classList.add("open");


            if (sidebarOverlay) {

                sidebarOverlay.classList.add(
                    "active"
                );

            }

        }


        function closeSidebar() {

            if (!sidebar) {
                return;
            }


            sidebar.classList.remove("open");


            if (sidebarOverlay) {

                sidebarOverlay.classList.remove(
                    "active"
                );

            }

        }


        if (mobileMenuBtn) {

            mobileMenuBtn.addEventListener(
                "click",
                openSidebar
            );

        }


        if (sidebarOverlay) {

            sidebarOverlay.addEventListener(
                "click",
                closeSidebar
            );

        }


        /* =====================================================
           SYSTEM MENU
        ===================================================== */

        const systemCards =
            document.querySelectorAll(
                ".system-card"
            );


        systemCards.forEach(
            function (card) {

                card.addEventListener(
                    "click",
                    function (event) {

                        event.preventDefault();


                        console.log(
                            "System Menu:",
                            card.innerText.trim()
                        );

                    }
                );

            }
        );



        /* =====================================================
           SEARCH
        ===================================================== */

        const searchInput =
            document.querySelector(
                ".search-box input"
            );


        if (searchInput) {

            searchInput.addEventListener(
                "keydown",
                function (event) {

                    if (
                        event.key === "Enter"
                    ) {

                        const keyword =
                            searchInput.value.trim();


                        if (
                            keyword !== ""
                        ) {

                            console.log(
                                "ค้นหา:",
                                keyword
                            );

                        }

                    }

                }
            );

        }



        /* =====================================================
           RESIZE
        ===================================================== */

        window.addEventListener(
            "resize",
            function () {

                if (
                    window.innerWidth > 1050
                ) {

                    closeSidebar();

                }

            }
        );



        /* =====================================================
           LOGIN SYSTEM
           WIANG CHAI E-DOCUMENT
        ===================================================== */

        const loginScreen =
            document.getElementById(
                "loginScreen"
            );

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        const loginEmail =
            document.getElementById(
                "loginEmail"
            );

        const loginPassword =
            document.getElementById(
                "loginPassword"
            );

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        const loginMessage =
            document.getElementById(
                "loginMessage"
            );


        /*
         * ตรวจสอบว่าหน้า Login มีองค์ประกอบครบหรือไม่
         */

        if (
            !loginScreen ||
            !loginForm ||
            !loginEmail ||
            !loginPassword ||
            !loginButton ||
            !loginMessage
        ) {

            console.error(
                "ไม่พบองค์ประกอบของหน้า Login"
            );

            return;

        }



        /* =====================================================
           ตรวจสอบ SESSION ที่มีอยู่
        ===================================================== */

        try {

            const {
                data,
                error
            } =
                await supabaseClient.auth.getSession();


            if (error) {

                console.error(
                    "ตรวจสอบ Session ไม่สำเร็จ:",
                    error
                );

                loginScreen.style.display =
                    "flex";

            }
            else if (data.session) {

                /*
                 * มี Session อยู่แล้ว
                 * ซ่อนหน้า Login
                 */

                loginScreen.style.display =
                    "none";


                console.log(
                    "มีผู้ใช้งานเข้าสู่ระบบอยู่แล้ว:",
                    data.session.user.email
                );

            }
            else {

                /*
                 * ยังไม่ได้ Login
                 * แสดงหน้า Login
                 */

                loginScreen.style.display =
                    "flex";

            }

        }
        catch (error) {

            console.error(
                "เกิดข้อผิดพลาดในการตรวจสอบ Session:",
                error
            );


            loginScreen.style.display =
                "flex";

        }



        /* =====================================================
           LOGIN FORM
        ===================================================== */

        loginForm.addEventListener(
            "submit",
            async function (event) {

                /*
                 * ป้องกัน Form รีเฟรชหน้า
                 */

                event.preventDefault();


                /* ---------------------------------------------
                   รับค่าจาก Form
                --------------------------------------------- */

                const email =
                    loginEmail.value.trim();

                const password =
                    loginPassword.value;


                /* ---------------------------------------------
                   ล้างข้อความเดิม
                --------------------------------------------- */

                loginMessage.textContent = "";


                loginMessage.classList.remove(
                    "error",
                    "success"
                );


                /* ---------------------------------------------
                   ตรวจสอบข้อมูลเบื้องต้น
                --------------------------------------------- */

                if (!email) {

                    loginMessage.textContent =
                        "กรุณากรอกอีเมล";

                    loginMessage.classList.add(
                        "error"
                    );


                    loginEmail.focus();

                    return;

                }


                if (!password) {

                    loginMessage.textContent =
                        "กรุณากรอกรหัสผ่าน";

                    loginMessage.classList.add(
                        "error"
                    );


                    loginPassword.focus();

                    return;

                }



                /* ---------------------------------------------
                   ป้องกันการกดปุ่มซ้ำ
                --------------------------------------------- */

                loginButton.disabled =
                    true;

                loginButton.textContent =
                    "กำลังเข้าสู่ระบบ...";



                /* ---------------------------------------------
                   LOGIN SUPABASE
                --------------------------------------------- */

                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient.auth
                            .signInWithPassword({

                                email: email,

                                password: password

                            });



                    /* -----------------------------------------
                       LOGIN ไม่สำเร็จ
                    ----------------------------------------- */

                    if (error) {

                        console.error(
                            "Login error:",
                            error
                        );


                        /*
                         * แจ้งผู้ใช้ทันที
                         */

                        loginMessage.textContent =
                            "อีเมลหรือรหัสผ่านไม่ถูกต้อง";

                        loginMessage.classList.add(
                            "error"
                        );


                        /*
                         * ล้างเฉพาะรหัสผ่าน
                         */

                        loginPassword.value = "";


                        /*
                         * ให้กลับไปกรอกรหัสใหม่
                         */

                        loginPassword.focus();


                        /*
                         * เปิดปุ่มกลับมาใช้งาน
                         */

                        loginButton.disabled =
                            false;

                        loginButton.textContent =
                            "เข้าสู่ระบบ";


                        return;

                    }



                    /* -----------------------------------------
                       LOGIN สำเร็จ
                    ----------------------------------------- */

                    console.log(
                        "เข้าสู่ระบบสำเร็จ:",
                        data.user.email
                    );


                    loginMessage.textContent =
                        "เข้าสู่ระบบสำเร็จ";

                    loginMessage.classList.add(
                        "success"
                    );


                    /*
                     * ซ่อนหน้า Login
                     */

                    loginScreen.style.display =
                        "none";


                    /*
                     * คืนค่าปุ่ม
                     */

                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "เข้าสู่ระบบ";


                }
                catch (error) {

                    /* -----------------------------------------
                       ระบบ / Internet มีปัญหา
                    ----------------------------------------- */

                    console.error(
                        "ระบบ Login ผิดพลาด:",
                        error
                    );


                    loginMessage.textContent =
                        "ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง";

                    loginMessage.classList.add(
                        "error"
                    );


                    loginButton.disabled =
                        false;

                    loginButton.textContent =
                        "เข้าสู่ระบบ";

                }

            }
        );



        /* =====================================================
           SESSION STATE CHANGE
        ===================================================== */

        supabaseClient.auth.onAuthStateChange(
            function (event, session) {

                console.log(
                    "Auth state:",
                    event
                );


                if (session) {

                    /*
                     * Login แล้ว
                     */

                    loginScreen.style.display =
                        "none";

                }
                else {

                    /*
                     * Logout หรือไม่มี Session
                     */

                    loginScreen.style.display =
                        "flex";

                }

            }
        );

       // =====================================================
// LOGOUT SYSTEM
// =====================================================

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {

    logoutBtn.addEventListener("click", async function () {

        const confirmLogout = confirm("ต้องการออกจากระบบหรือไม่?");

        if (!confirmLogout) {
            return;
        }

        logoutBtn.disabled = true;

        try {

            const { error } = await supabaseClient.auth.signOut();

            if (error) {
                throw error;
            }

            // กลับไปหน้า Login
            loginScreen.style.display = "flex";

            // ล้างรหัสผ่าน
            if (loginPassword) {
                loginPassword.value = "";
            }

            // ล้างข้อความแจ้งเตือน
            if (loginMessage) {
                loginMessage.textContent = "";
                loginMessage.classList.remove(
                    "error",
                    "success"
                );
            }

            // กลับไปช่อง Email
            if (loginEmail) {
                loginEmail.focus();
            }

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );

            alert(
                "ไม่สามารถออกจากระบบได้ กรุณาลองใหม่อีกครั้ง"
            );

        } finally {

            logoutBtn.disabled = false;

        }

    });

}


    }
);


/* =====================================================
   ขั้นที่ 14.2: โหลดรายการหนังสือรอรับ
   ===================================================== */

async function loadIncomingDocumentDispatches() {
    try {
        const {
            data: { session },
            error: sessionError
        } = await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session) {
            console.warn("กรุณาเข้าสู่ระบบก่อนดูหนังสือรอรับ");
            return [];
        }

        const { data, error } = await supabaseClient.rpc(
            "get_incoming_document_dispatches"
        );

        if (error) throw error;

        const documents = Array.isArray(data) ? data : [];

        console.log("รายการหนังสือรอรับ:", documents);
        return documents;
    } catch (error) {
        console.error(
            "โหลดรายการหนังสือรอรับไม่สำเร็จ:",
            error.message
        );
        return [];
    }
}


/* =====================================================
   ขั้นที่ 14.3: แสดงหนังสือรอรับในตารางหน้าเว็บ
   ===================================================== */

function formatThaiDateTime(value) {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleString("th-TH", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Bangkok"
    });
}

async function renderIncomingDocumentDispatches() {
    const tbody = document.getElementById("incomingDocumentsBody");
    const message = document.getElementById("incomingMessage");

    if (!tbody || !message) {
        console.warn("ไม่พบตารางหนังสือรอรับใน index.html");
        return;
       renderIncomingDocumentDispatches();
    }

    message.textContent = "กำลังโหลดรายการหนังสือ...";
    tbody.replaceChildren();

    const documents = await loadIncomingDocumentDispatches();

    if (documents.length === 0) {
        message.textContent = "ไม่มีหนังสือรอรับในขณะนี้";
        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 5;
        cell.style.padding = "16px";
        cell.textContent = "ไม่พบรายการหนังสือที่รอรับ";

        row.appendChild(cell);
        tbody.appendChild(row);
        return;
    }

    message.textContent = `พบหนังสือรอรับ ${documents.length} รายการ`;

    documents.forEach((doc) => {
        const row = document.createElement("tr");

        [
            doc.document_no || "-",
            doc.subject || "-",
            doc.sender_name || "-",
            formatThaiDateTime(doc.dispatched_at),
            doc.status || "รอรับ"
        ].forEach((value) => {
            const cell = document.createElement("td");
            cell.style.padding = "12px";
            cell.style.borderTop = "1px solid #e5e7eb";
            cell.textContent = value;
            row.appendChild(cell);
        });

        tbody.appendChild(row);
    });
}

/* =====================================================
   ขั้นที่ 14.4: ปุ่มโหลดรายการหนังสือรอรับ
===================================================== */

if (refreshIncomingButton) {
    refreshIncomingButton.addEventListener(
        "click",
        renderIncomingDocumentDispatches
    );
}


