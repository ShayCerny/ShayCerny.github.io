window.addEventListener("scroll", () => {
	const scrollY = window.scrollY;
	document.querySelector("#scene-city").style.transform = `translateY(${-scrollY * 0.25}px)`;

	if (scrollY >= 200) {
		document.querySelector(".scroll-indicator").classList.add("hidden");
	}else{
        document.querySelector(".scroll-indicator").classList.remove("hidden");
    }
});
