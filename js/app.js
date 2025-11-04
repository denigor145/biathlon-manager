// Главный файл инициализации приложения
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM загружен, инициализация Биатлон Менеджера...");
    
    // Проверяем среду выполнения
    if (window.Telegram && Telegram.WebApp) {
        console.log("Запуск в Telegram Web App");
        Telegram.WebApp.ready();
        Telegram.WebApp.expand();
        
        // Устанавливаем фон Telegram
        document.body.style.background = Telegram.WebApp.backgroundColor;
    } else {
        console.log("Запуск в браузере");
    }
    
    // Инициализация игры
    try {
        // Создаем экземпляры классов
        window.biathlonGame = new BiathlonGame();
        window.gameUI = new GameUI(window.biathlonGame);
        
        // Настраиваем обработчики событий
        window.gameUI.setupEventListeners();
        
        // Обновляем интерфейс
        window.gameUI.updateDisplay();
        
        // Запускаем гонку
        window.biathlonGame.startRace();
        
        console.log("Биатлон Менеджер успешно запущен!");
        
    } catch (error) {
        console.error("Ошибка запуска игры:", error);
        alert("Ошибка загрузки игры. Проверьте консоль для деталей.");
    }
    
    // Адаптация под мобильные устройства
    function adjustForMobile() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    window.addEventListener('resize', adjustForMobile);
    adjustForMobile();
    
    console.log("Приложение полностью инициализировано!");
});
