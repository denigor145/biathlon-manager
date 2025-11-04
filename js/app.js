// Главный файл инициализации приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализация Биатлон Менеджера...");
    
    // Даем время на полную загрузку DOM
    setTimeout(() => {
        initializeGame();
    }, 100);
});

function initializeGame() {
    try {
        // Проверяем среду выполнения
        if (window.Telegram && Telegram.WebApp) {
            console.log("Запуск в Telegram Web App");
            Telegram.WebApp.ready();
            Telegram.WebApp.expand();
        } else {
            console.log("Запуск в браузере");
        }
        
        // Создаем экземпляры классов
        window.biathlonGame = new BiathlonGame();
        window.gameUI = new GameUI(window.biathlonGame);
        
        // Показываем главное меню
        window.gameUI.showScreen('mainMenu');
        
        // Автоматически выбираем первую гонку
        setTimeout(() => {
            const firstRaceCard = document.querySelector('.race-card');
            if (firstRaceCard) {
                firstRaceCard.click();
            }
        }, 200);
        
        console.log("Биатлон Менеджер успешно запущен!");
        
        // Запускаем игровой цикл
        startGameLoop();
        
    } catch (error) {
        console.error("Ошибка запуска игры:", error);
        alert("Ошибка загрузки игры: " + error.message);
    }
}

// Игровой цикл
function startGameLoop() {
    function gameUpdate() {
        if (window.biathlonGame && window.biathlonGame.isRacing && window.gameUI) {
            window.gameUI.updateDisplay();
        }
        requestAnimationFrame(gameUpdate);
    }
    gameUpdate();
}

// Адаптация под мобильные устройства
function adjustForMobile() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

window.addEventListener('resize', adjustForMobile);
adjustForMobile();