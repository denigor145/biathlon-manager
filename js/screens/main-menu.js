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
        
        const locationBtn = document.getElementById('locationBtn');
        if (locationBtn) {
            locationBtn.addEventListener('click', () => {
                this.showLocationSelection();
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
    
    showLocationSelection() {
        console.log("Opening location selection...");
        this.showLocationSelectionDialog();
    }
    
    showLocationSelectionDialog() {
        const locationHTML = `
            <div class="location-dialog" style="
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
                    max-width: 600px;
                    width: 90%;
                    text-align: center;
                    color: white;
                    max-height: 80vh;
                    overflow-y: auto;
                ">
                    <h2 style="color: #FFD700; margin-bottom: 20px;">🌍 Выбор локации</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 25px;">
                        ${this.generateLocationCards()}
                    </div>
                    
                    <button id="closeLocationSelection" style="
                        background: linear-gradient(135deg, #4CAF50, #2E7D32);
                        color: white;
                        border: none;
                        padding: 12px 25px;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: bold;
                        width: 100%;
                    ">Закрыть</button>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = locationHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Добавляем обработчики для выбора локации
        tempDiv.firstElementChild.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const locationId = parseInt(e.currentTarget.getAttribute('data-location'));
                this.selectLocation(locationId);
                tempDiv.firstElementChild.remove();
            });
        });
        
        const closeBtn = tempDiv.firstElementChild.querySelector('#closeLocationSelection');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                tempDiv.firstElementChild.remove();
            });
        }
    }

    // Генерация карточек локаций
    generateLocationCards() {
        if (!window.biathlonGame) return '';
        
        return window.biathlonGame.locations.map((location, index) => {
            const playerLevel = window.playerProfile ? Math.max(
                window.playerProfile.stats.runningSpeed,
                window.playerProfile.stats.accuracy,
                window.playerProfile.stats.shootingSpeed,
                window.playerProfile.stats.stamina
            ) : 0;
            
            const isLocked = playerLevel < location.minLevel;
            const isCurrent = window.biathlonGame.currentLocation === index;
            
            return `
                <div class="location-card ${isCurrent ? 'selected' : ''} ${isLocked ? 'locked' : ''}" 
                     data-location="${index}"
                     style="
                         background: ${isLocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)'};
                         border-radius: 15px;
                         padding: 15px;
                         cursor: ${isLocked ? 'not-allowed' : 'pointer'};
                         border: 2px solid ${isCurrent ? '#FFD700' : (isLocked ? '#666' : '#4FC3F7')};
                         opacity: ${isLocked ? 0.6 : 1};
                     ">
                    <h3 style="color: ${isLocked ? '#999' : '#4FC3F7'}; margin-bottom: 10px;">
                        ${isLocked ? '🔒 ' : ''}${location.name}
                    </h3>
                    <p style="font-size: 12px; margin-bottom: 8px;">Уровни: ${location.minLevel}-${location.maxLevel}</p>
                    <p style="font-size: 12px; margin-bottom: 8px;">Сложность: ${'⭐'.repeat(location.difficulty)}</p>
                    ${isLocked ? 
                        `<p style="font-size: 11px; color: #FF5252;">Требуется уровень: ${location.minLevel}+</p>` : 
                        `<p style="font-size: 11px; color: #4CAF50;">Доступно</p>`
                    }
                </div>
            `;
        }).join('');
    }

    // Выбор локации
    selectLocation(locationId) {
        if (window.biathlonGame) {
            const success = window.biathlonGame.setLocation(locationId);
            if (success) {
                this.showMessage(`Локация изменена: ${window.biathlonGame.getCurrentLocation().name}`, "success");
            } else {
                this.showMessage("Ошибка при смене локации", "error");
            }
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
                            <p>• Спринт: 7.65 км, 3 круга, 2 стрельбы</p>
                            <p>• Гонка преследования: 8.4 км, 4 круга, 4 стрельбы</p>
                            <p>• Масс-старт: 12.75 км, 5 кругов, 4 стрельбы</p>
                            <p>• Индивидуальная: 15 км, 5 кругов, 4 стрельбы</p>
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
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            padding: 15px 25px;
            border-radius: 10px;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 80%;
            text-align: center;
        `;
        
        switch(type) {
            case 'success':
                messageDiv.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
                messageDiv.style.color = 'white';
                break;
            case 'error':
                messageDiv.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
                messageDiv.style.color = 'white';
                break;
            default:
                messageDiv.style.background = 'linear-gradient(135deg, #2196F3, #1565C0)';
                messageDiv.style.color = 'white';
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 300);
        }, 3000);
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
