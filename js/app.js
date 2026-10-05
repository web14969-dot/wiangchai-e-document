/* =========================================================
   WIANG CHAI E-DOCUMENT
   APPLICATION JAVASCRIPT
   2026
========================================================= */

/* =====================================================
   SUPABASE CONNECTION
   WIANG CHAI E-DOCUMENT
   ===================================================== */

const SUPABASE_URL = "https://oplchatspdhzriljmlid.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_Y0EpLZUgaSV89F73i1Y86Q_kGokgZc4";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client connected:", !!supabaseClient);

document.addEventListener("DOMContentLoaded", function () {

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

        if (!sidebar) return;

        sidebar.classList.add("open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.add("active");
        }
    }


    function closeSidebar() {

        if (!sidebar) return;

        sidebar.classList.remove("open");

        if (sidebarOverlay) {
            sidebarOverlay.classList.remove("active");
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
       SIDEBAR ACTIVE MENU
    ===================================================== */

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(function (item) {

        item.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                navItems.forEach(
                    function (nav) {
                        nav.classList.remove("active");
                    }
                );


                item.classList.add("active");


                if (
                    window.innerWidth <= 1050
                ) {

                    closeSidebar();
                }

            }
        );

    });



    /* =====================================================
       QUICK ACTION
    ===================================================== */

    const quickCards =
        document.querySelectorAll(".quick-card");


    quickCards.forEach(function (card) {

        card.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                console.log(
                    "Quick Action:",
                    card.innerText.trim()
                );

            }
        );

    });



    /* =====================================================
       SYSTEM MENU
    ===================================================== */

    const systemCards =
        document.querySelectorAll(".system-card");


    systemCards.forEach(function (card) {

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

    });



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

                if (event.key === "Enter") {

                    const keyword =
                        searchInput.value.trim();


                    if (keyword !== "") {

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

});
