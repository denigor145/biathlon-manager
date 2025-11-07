class MainMenu {
    constructor() {
        this.isInitialized = false;
        
        console.log("MainMenu создан");
        
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        console.log("Инициализация MainMenu...");
        
        try {
            this.setupEventListeners();
            this.setupRaceSelection();
            this.isInitialized = true;
            
            console.log("MainMenu успешно инициализирован");
        } catch (error) {
            console.error("Ошибка инициализации MainMenu:", error);
        }
    }
    
    setupEventListeners() {
        const startBtn = document.getElementById('startRace');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStartRace();
            });
        } else {
            console.error("Кнопка startRace не найдена!");
        }
        
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        const characterBtn = document.getElementById('characterBtn');
        if (characterBtn) {
            characterBtn.addEventListener('click', () => {
                this.showCharacterScreen();
            });
        }
        
        console.log("Обработчики MainMenu установлены");
    }
    
    setupRaceSelection() {
        document.querySelectorAll('.race-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleRaceCardClick(card);
            });
        });
        
        const defaultRace = document.querySelector('.race-card[data-race="sprint"]');
        if (defaultRace) {
            this.handleRaceCardClick(defaultRace);
        }
    }
    
    handleRaceCardClick(card) {
        document.querySelectorAll('.race-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        card.classList.add('selected');
        
        const raceType = card.getAttribute('data-race');
        
        if (window.biathlonGame) {
            window.biathlonGame.selectRaceType(raceType);
            console.log(`Выбрана гонка: ${raceType}`);
        } else {
            console.error("BiathlonGame не доступен");
        }
    }
    
    handleStartRace() {
        console.log("=== START RACE CLICKED ===");
        
        if (!window.biathlonGame) {
            console.error("BiathlonGame не доступен");
            alert("Ошибка: игровая система не загружена");
            return;
        }
        
        const selectedRace = window.biathlonGame.getSelectedRace();
        console.log("Selected race:", selectedRace);
        
        if (selectedRace) {
            this.startGame();
        } else {
            alert('Пожалуйста, выберите тип гонки!');
        }
    }
    
    startGame() {
        console.log("Starting game...");
        
        if (window.playerProfile && window.biathlonGame && window.biathlonGame.player) {
            window.playerProfile.applyToGamePlayer(window.biathlonGame.player);
            console.log("Характеристики игрока применены перед стартом гонки");
        }
        
        const success = window.biathlonGame.startRace();
        console.log("Race started:", success);
        
        if (success) {
            this.hide();
        } else {
            console.error("Не удалось начать гонку");
            alert("Ошибка при запуске гонки");
        }
    }
    
    showCharacterScreen() {
        console.log("Opening character screen...");
        
        if (window.characterScreen) {
            window.characterScreen.show();
        } else {
            console.error("CharacterScreen не доступен");
            alert("Система характеристик временно недоступна");
        }
    }
    
    showSettings() {
        this.showSettingsDialog();
    }
    
    showSettingsDialog() {
        const settingsHTML = `
            <div class="settings-dialog" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
                    padding: 30px;
                    border-radius: 20px;
                    border: 3px solid #4FC3F7;
                    max-width: 500px;
                    width: 90%;
                    text-align: center;
                    color: white;
                ">
                    <h2 style="color: #FFD700; margin-bottom: 20px;">⚙️ Настройки</h2>
                    
                    <div style="text-align: left; margin-bottom: 25px;">
                        <div style="margin-bottom: 15px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">Управление</h3>
                            <p>• Спринт: кнопка "💨 Спринт!"</p>
                            <p>• Медленный темп: кнопка "🐢 Снизить темп"</p>
                            <p>• Меню: кнопка "⚙️ Меню"</p>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">Характеристики</h3>
                            <p>• Управляйте характеристиками в разделе "👤 Персонаж"</p>
                            <p>• Распределяйте очки между навыками</p>
                        </div>
                        
                        <div>
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">Гонки</h3>
                            <p>• Спринт: 3 км, 2 стрельбы</p>
                            <p>• Гонка преследования: 5 км, 4 стрельбы</p>
                            <p>• Индивидуальная: 6 км, 4 стрельбы</p>
                        </div>
                    </div>
                    
                    <div style="display: flex; gap: 15px; justify-content: center;">
                        <button id="closeSettings" style="
                            background: linear-gradient(135deg, #4CAF50, #2E7D32);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Понятно</button>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = settingsHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        const closeBtn = tempDiv.firstElementChild.querySelector('#closeSettings');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                tempDiv.firstElementChild.remove();
            });
        }
    }
    
    show() {
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            mainMenu.classList.add('active');
            console.log("MainMenu показан");
        }
    }
    
    hide() {
        const mainMenu = document.getElementById('mainMenu');
        if (mainMenu) {
            mainMenu.classList.remove('active');
            console.log("MainMenu скрыт");
        }
    }
    
    isReady() {
        return this.isInitialized;
    }
    
    getSelectedRaceType() {
        const selectedCard = document.querySelector('.race-card.selected');
        return selectedCard ? selectedCard.getAttribute('data-race') : 'sprint';
    }
}
