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
        
        // Настраиваем обработчики событий для игры
        window.gameUI.setupEventListeners();
        
        // Запускаем игровой цикл
        startGameLoop();
        
        // Показываем главное меню
        window.gameUI.showScreen('mainMenu');
        
        // Автоматически выбираем первую гонку
        setTimeout(() => {
            const firstRaceCard = document.querySelector('.race-card');
            if (firstRaceCard) {
                firstRaceCard.classList.add('selected');
                const raceType = firstRaceCard.getAttribute('data-race');
                window.biathlonGame.selectRaceType(raceType);
            }
        }, 100);
        
        console.log("Биатлон Менеджер успешно запущен!");
        
    } catch (error) {
        console.error("Ошибка запуска игры:", error);
        alert("Ошибка загрузки игры. Проверьте консоль для деталей.");
    }
    
    // Игровой цикл
    function startGameLoop() {
        function gameUpdate() {
            if (window.biathlonGame && window.biathlonGame.isRacing) {
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
        
        // Дополнительные мобильные настройки
        if (window.innerWidth <= 768) {
            document.body.style.fontSize = '14px';
        } else {
            document.body.style.fontSize = '16px';
        }
    }
    
    window.addEventListener('resize', adjustForMobile);
    adjustForMobile();
    
    // Обработка видимости страницы (пауза при сворачивании)
    document.addEventListener('visibilitychange', function() {
        if (window.biathlonGame) {
            if (document.hidden) {
                console.log("Страница скрыта - пауза игры");
                // Здесь можно добавить логику паузы
            } else {
                console.log("Страница видима - возобновление игры");
            }
        }
    });
    
    console.log("Приложение полностью инициализировано!");
    
    // Глобальные функции для отладки
    window.debugGame = {
        showGameState: function() {
            console.log("Состояние игры:", {
                racing: window.biathlonGame.isRacing,
                shooting: window.biathlonGame.isShooting,
                segment: window.biathlonGame.currentSegment,
                player: window.biathlonGame.player
            });
        },
        skipToShooting: function() {
            if (window.biathlonGame.isRacing) {
                window.biathlonGame.currentSegment = 19;
                console.log("Переход к стрельбе");
            }
        },
        finishRace: function() {
            if (window.biathlonGame.isRacing) {
                const race = window.biathlonGame.getCurrentRace();
                window.biathlonGame.currentSegment = race.totalSegments;
                console.log("Принудительное завершение гонки");
            }
        }
    };
});