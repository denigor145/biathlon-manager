class MainMenu {
    constructor() {
        this.isInitialized = false;
        
        console.log("MainMenu создан");
        
        // Даем время на загрузку DOM
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
        // Кнопка "Начать гонку"
        const startBtn = document.getElementById('startRace');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.handleStartRace();
            });
        } else {
            console.error("Кнопка startRace не найдена!");
        }
        
        // Кнопка "Настройки"
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        
        // Кнопка "Персонаж" (новая кнопка)
        const characterBtn = document.getElementById('characterBtn');
        if (characterBtn) {
            characterBtn.addEventListener('click', () => {
                this.showCharacterScreen();
            });
        }
        
        console.log("Обработчики MainMenu установлены");
    }
    
    setupRaceSelection() {
        // Выбор типа гонки
        document.querySelectorAll('.race-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleRaceCardClick(card);
            });
        });
        
        // Выбираем спринт по умолчанию
        const defaultRace = document.querySelector('.race-card[data-race="sprint"]');
        if (defaultRace) {
            this.handleRaceCardClick(defaultRace);
        }
    }
    
    handleRaceCardClick(card) {
        // Убираем выделение у всех карточек
        document.querySelectorAll('.race-card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Выделяем выбранную карточку
        card.classList.add('selected');
        
        const raceType = card.getAttribute('data-race');
        
        // Сохраняем выбранный тип гонки
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
        
        // Применяем характеристики игрока перед стартом гонки
        if (window.playerProfile && window.biathlonGame && window.biathlonGame.player) {
            window.playerProfile.applyToGamePlayer(window.biathlonGame.player);
            console.log("Характеристики игрока применены перед стартом гонки");
        }
        
        // Запускаем гонку
        const success = window.biathlonGame.startRace();
        console.log("Race started:", success);
        
        if (success && window.gameScreen) {
            // Показываем стартовый экран гонки через gameScreen
            window.biathlonGame.showStartStage();
        } else {
            console.error("Не удалось начать гонку");
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
                        <button onclick="this.closest('.settings-dialog').remove()" style="
                            background: linear-gradient(135deg, #4CAF50, #2E7D32);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Понятно</button>
                        
                        <button onclick="this.showAdvancedSettings()" style="
                            background: rgba(255,255,255,0.15);
                            color: white;
                            border: 2px solid rgba(255,255,255,0.3);
                            padding: 12px 25px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: bold;
                        ">Дополнительно</button>
                    </div>
                </div>
            </div>
        `;
        
        // Добавляем диалог в DOM
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = settingsHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Добавляем обработчик для дополнительных настроек
        tempDiv.firstElementChild.querySelector('button:last-child').onclick = () => {
            this.showAdvancedSettings();
        };
    }
    
    showAdvancedSettings() {
        // Удаляем предыдущий диалог
        const existingDialog = document.querySelector('.settings-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        const advancedHTML = `
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
                    <h2 style="color: #FFD700; margin-bottom: 20px;">🔧 Дополнительные настройки</h2>
                    
                    <div style="text-align: left; margin-bottom: 25px;">
                        <div style="margin-bottom: 15px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">Управление данными</h3>
                            <button onclick="this.exportData()" style="
                                background: linear-gradient(135deg, #2196F3, #1565C0);
                                color: white;
                                border: none;
                                padding: 10px 15px;
                                border-radius: 8px;
                                cursor: pointer;
                                margin-right: 10px;
                                margin-bottom: 10px;
                                width: 100%;
                            ">📤 Экспорт данных</button>
                            
                            <button onclick="this.importData()" style="
                                background: linear-gradient(135deg, #FF9800, #F57C00);
                                color: white;
                                border: none;
                                padding: 10px 15px;
                                border-radius: 8px;
                                cursor: pointer;
                                margin-bottom: 10px;
                                width: 100%;
                            ">📥 Импорт данных</button>
                            
                            <button onclick="this.clearData()" style="
                                background: linear-gradient(135deg, #F44336, #C62828);
                                color: white;
                                border: none;
                                padding: 10px 15px;
                                border-radius: 8px;
                                cursor: pointer;
                                width: 100%;
                            ">🗑️ Очистить данные</button>
                        </div>
                        
                        <div style="margin-bottom: 15px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">Отладочная информация</h3>
                            <p>Версия игры: 1.0</p>
                            <p>Характеристики: ${window.playerProfile ? 'Загружены' : 'Не загружены'}</p>
                            <p>Игровая система: ${window.biathlonGame ? 'Готова' : 'Не готова'}</p>
                        </div>
                    </div>
                    
                    <button onclick="this.closest('.settings-dialog').remove()" style="
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
        tempDiv.innerHTML = advancedHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Добавляем обработчики для кнопок управления данными
        const dialog = tempDiv.firstElementChild;
        dialog.querySelector('button:nth-child(1)').onclick = () => this.exportData();
        dialog.querySelector('button:nth-child(2)').onclick = () => this.importData();
        dialog.querySelector('button:nth-child(3)').onclick = () => this.clearData();
    }
    
    exportData() {
        if (window.playerProfile) {
            const data = {
                playerProfile: {
                    stats: window.playerProfile.getAllStats(),
                    availablePoints: window.playerProfile.getAvailablePoints()
                },
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'biathlon_manager_save.json';
            a.click();
            
            URL.revokeObjectURL(url);
            alert('Данные успешно экспортированы!');
        }
    }
    
    importData() {
        alert('Функция импорта будет реализована в будущих версиях');
    }
    
    clearData() {
        if (confirm('ВНИМАНИЕ: Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
            localStorage.removeItem('biathlonPlayerProfile');
            if (window.playerProfile) {
                window.playerProfile.resetStats();
            }
            alert('Данные очищены. Страница будет перезагружена.');
            location.reload();
        }
    }
    
    // Показать главное меню
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
    
    // Проверить инициализацию
    isReady() {
        return this.isInitialized;
    }
    
    // Получить выбранный тип гонки
    getSelectedRaceType() {
        const selectedCard = document.querySelector('.race-card.selected');
        return selectedCard ? selectedCard.getAttribute('data-race') : 'sprint';
    }
}
