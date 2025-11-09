class MainMenu {
    constructor() {
        this.isInitialized = false;
        this.selectedRaceType = "sprint";
        
        console.log("MainMenu создан для непрерывной системы");
        
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        console.log("Инициализация MainMenu для непрерывной системы...");
        
        try {
            this.setupEventListeners();
            this.setupRaceSelection();
            this.updateRaceCards();
            this.isInitialized = true;
            
            console.log("MainMenu успешно инициализирован для непрерывной системы");
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
        
        console.log("Обработчики MainMenu установлены для непрерывной системы");
    }
    
    setupRaceSelection() {
        document.querySelectorAll('.race-card').forEach(card => {
            card.addEventListener('click', () => {
                this.handleRaceCardClick(card);
            });
        });
        
        // Устанавливаем спринт по умолчанию
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
        this.selectedRaceType = raceType;
        
        if (window.biathlonGame) {
            window.biathlonGame.selectRaceType(raceType);
            console.log(`Выбрана гонка: ${raceType}`);
        } else {
            console.error("BiathlonGame не доступен");
        }
        
        // Обновляем информацию о рекомендуемых характеристиках
        this.updateRecommendedStats(raceType);
    }
    
    // Обновление карточек гонок с новой информацией о дистанциях
    updateRaceCards() {
        Object.keys(GameConstants.RACE_TYPES).forEach(raceType => {
            const race = GameConstants.RACE_TYPES[raceType];
            const card = document.querySelector(`.race-card[data-race="${raceType}"]`);
            
            if (card) {
                // Обновляем основную информацию
                const title = card.querySelector('h3');
                if (title) {
                    title.textContent = race.name;
                }
                
                const description = card.querySelector('p');
                if (description) {
                    description.textContent = `${(race.totalDistance / 1000).toFixed(2)} км • ${race.shootingRounds.length} стрельбы`;
                }
                
                // Обновляем статистику
                const stats = card.querySelector('.race-stats');
                if (stats) {
                    stats.innerHTML = `
                        <span>📏 ${(race.lapDistance / 1000).toFixed(1)}km/круг</span>
                        <span>🎯 ${race.shootingRounds.length}x</span>
                        <span>⏱️ ${race.totalLaps} кругов</span>
                    `;
                }
                
                // Добавляем информацию о штрафах
                const penaltyInfo = card.querySelector('.penalty-info') || document.createElement('div');
                if (!card.querySelector('.penalty-info')) {
                    penaltyInfo.className = 'penalty-info';
                    penaltyInfo.style.cssText = `
                        font-size: 0.8em;
                        margin-top: 8px;
                        padding: 4px 8px;
                        border-radius: 8px;
                        background: rgba(255,255,255,0.1);
                    `;
                    card.appendChild(penaltyInfo);
                }
                
                if (race.penaltyType === 'minutes') {
                    penaltyInfo.innerHTML = `⏰ Штраф: ${race.penaltyPerMiss / 60} мин/промах`;
                    penaltyInfo.style.background = 'rgba(255,152,0,0.2)';
                } else {
                    penaltyInfo.innerHTML = `⏰ Штраф: ${race.penaltyLoopDistance}м круг/промах`;
                    penaltyInfo.style.background = 'rgba(244,67,54,0.2)';
                }
            }
        });
    }
    
    // Обновление рекомендуемых характеристик для выбранной гонки
    updateRecommendedStats(raceType) {
        if (!window.playerProfile) return;
        
        const recommendedStats = window.playerProfile.getRecommendedStats(raceType);
        const efficiency = window.playerProfile.getEfficiencyForRace(raceType);
        
        // Создаем или обновляем блок с рекомендациями
        let recommendationElement = document.getElementById('raceRecommendation');
        if (!recommendationElement) {
            recommendationElement = document.createElement('div');
            recommendationElement.id = 'raceRecommendation';
            recommendationElement.style.cssText = `
                background: rgba(255,255,255,0.1);
                border-radius: 15px;
                padding: 15px;
                margin: 15px 0;
                border-left: 4px solid #4FC3F7;
            `;
            
            const raceSelection = document.querySelector('.race-selection');
            if (raceSelection) {
                raceSelection.appendChild(recommendationElement);
            }
        }
        
        const race = GameConstants.RACE_TYPES[raceType.toUpperCase()];
        const progressInfo = window.playerProfile.getProgressInfo();
        
        recommendationElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="color: #4FC3F7; margin: 0;">📊 Подготовка к гонке</h4>
                <div style="background: ${this.getEfficiencyColor(efficiency.percentage)}; padding: 4px 8px; border-radius: 10px; font-size: 0.8em;">
                    ${efficiency.percentage}% - ${efficiency.description}
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                <div style="text-align: center;">
                    <div style="color: #FFD700; font-weight: bold;">${progressInfo.speed}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Скорость</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #FFD700; font-weight: bold;">${progressInfo.lapTime}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Время круга</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #FFD700; font-weight: bold;">${progressInfo.shootingTime}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Время стрельбы</div>
                </div>
                <div style="text-align: center;">
                    <div style="color: #FFD700; font-weight: bold;">${progressInfo.accuracyProne}</div>
                    <div style="font-size: 0.8em; opacity: 0.8;">Меткость лёжа</div>
                </div>
            </div>
            
            ${efficiency.percentage < 70 ? `
                <div style="margin-top: 10px; padding: 8px; background: rgba(255,152,0,0.2); border-radius: 8px; font-size: 0.8em;">
                    💡 Совет: Улучшите характеристики для лучших результатов в этой гонке
                </div>
            ` : ''}
        `;
    }
    
    getEfficiencyColor(percentage) {
        if (percentage >= 90) return 'rgba(76,175,80,0.3)';
        if (percentage >= 70) return 'rgba(255,193,7,0.3)';
        if (percentage >= 50) return 'rgba(255,152,0,0.3)';
        return 'rgba(244,67,54,0.3)';
    }
    
    handleStartRace() {
        console.log("=== START RACE CLICKED ===");
        
        if (!window.biathlonGame) {
            console.error("BiathlonGame не доступен");
            this.showMessage("Ошибка: игровая система не загружена", "error");
            return;
        }
        
        const selectedRace = window.biathlonGame.getSelectedRace();
        console.log("Selected race:", selectedRace);
        
        if (selectedRace) {
            this.startGame();
        } else {
            this.showMessage('Пожалуйста, выберите тип гонки!', "error");
        }
    }
    
    startGame() {
        console.log("Starting game with continuous system...");
        
        // Инициализируем гонку
        const success = window.biathlonGame.initializeRace(this.selectedRaceType);
        
        if (success) {
            console.log("Гонка инициализирована, переходим к экрану старта");
            
            // Применяем характеристики игрока
            if (window.playerProfile && window.biathlonGame.player) {
                window.playerProfile.applyToGamePlayer(window.biathlonGame.player);
                console.log("Характеристики игрока применены перед стартом гонки");
            }
            
            // Показываем экран старта гонки
            this.hide();
            
            if (window.gameScreen) {
                window.gameScreen.showStartStage();
            }
        } else {
            console.error("Не удалось инициализировать гонку");
            this.showMessage("Ошибка при инициализации гонки", "error");
        }
    }
    
    showCharacterScreen() {
        console.log("Opening character screen...");
        
        if (window.characterScreen) {
            window.characterScreen.show();
        } else {
            console.error("CharacterScreen не доступен");
            this.showMessage("Система характеристик временно недоступна", "error");
        }
    }
    
    showLocationSelection() {
        console.log("Opening location selection...");
        this.showLocationSelectionDialog();
    }
    
    showLocationSelectionDialog() {
        if (!window.biathlonGame) {
            this.showMessage("Игровая система не загружена", "error");
            return;
        }
        
        const locationHTML = `
            <div class="location-dialog" style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.9);
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
                    max-width: 900px;
                    width: 90%;
                    text-align: center;
                    color: white;
                    max-height: 90vh;
                    overflow-y: auto;
                ">
                    <h2 style="color: #FFD700; margin-bottom: 20px;">🌍 Выбор локации</h2>
                    <p style="margin-bottom: 20px; opacity: 0.8;">Каждая локация имеет уникальные условия и ограничения уровней ботов</p>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 15px; margin-bottom: 25px;">
                        ${this.generateLocationCards()}
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button id="closeLocationSelection" style="
                            background: linear-gradient(135deg, #4CAF50, #2E7D32);
                            color: white;
                            border: none;
                            padding: 12px 25px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: bold;
                            flex: 1;
                            max-width: 200px;
                        ">Выбрать</button>
                        <button id="cancelLocationSelection" style="
                            background: rgba(255,255,255,0.15);
                            color: white;
                            border: 2px solid rgba(255,255,255,0.3);
                            padding: 12px 25px;
                            border-radius: 10px;
                            cursor: pointer;
                            font-weight: bold;
                            flex: 1;
                            max-width: 200px;
                        ">Отмена</button>
                    </div>
                </div>
            </div>
        `;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = locationHTML;
        document.body.appendChild(tempDiv.firstElementChild);
        
        // Обработчики для карточек локаций
        tempDiv.firstElementChild.querySelectorAll('.location-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Снимаем выделение со всех карточек
                tempDiv.firstElementChild.querySelectorAll('.location-card').forEach(c => {
                    c.classList.remove('selected');
                });
                
                // Выделяем выбранную карточку
                e.currentTarget.classList.add('selected');
            });
        });
        
        // Обработчик выбора локации
        const selectBtn = tempDiv.firstElementChild.querySelector('#closeLocationSelection');
        if (selectBtn) {
            selectBtn.addEventListener('click', () => {
                const selectedCard = tempDiv.firstElementChild.querySelector('.location-card.selected');
                if (selectedCard) {
                    const locationId = parseInt(selectedCard.getAttribute('data-location'));
                    this.selectLocation(locationId);
                } else {
                    this.showMessage("Пожалуйста, выберите локацию", "warning");
                }
                tempDiv.firstElementChild.remove();
            });
        }
        
        // Обработчик отмены
        const cancelBtn = tempDiv.firstElementChild.querySelector('#cancelLocationSelection');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                tempDiv.firstElementChild.remove();
            });
        }
    }

    // Генерация карточек локаций с информацией об уровнях ботов
    generateLocationCards() {
        if (!window.biathlonGame) return '';
        
        return window.biathlonGame.locations.map((location, index) => {
            const accessInfo = window.biathlonGame.getLocationAccessInfo(index);
            const isCurrent = window.biathlonGame.currentLocationId === index;
            const playerLevel = accessInfo.playerLevel;
            
            return `
                <div class="location-card ${isCurrent ? 'selected' : ''}" 
                     data-location="${index}"
                     style="
                         background: rgba(255,255,255,0.15);
                         border-radius: 15px;
                         padding: 20px;
                         cursor: pointer;
                         border: 2px solid ${isCurrent ? '#FFD700' : '#4FC3F7'};
                         transition: all 0.3s ease;
                         position: relative;
                         overflow: hidden;
                     ">
                    ${isCurrent ? `
                        <div style="position: absolute; top: 10px; right: 10px; background: #FFD700; color: black; padding: 2px 8px; border-radius: 10px; font-size: 0.8em; font-weight: bold;">
                            ТЕКУЩАЯ
                        </div>
                    ` : ''}
                    
                    <h3 style="color: #4FC3F7; margin-bottom: 15px; font-size: 1.2em;">
                        ${location.name}
                    </h3>
                    
                    <div style="text-align: left; margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="opacity: 0.8;">Сложность:</span>
                            <span style="color: #FFD700;">${'⭐'.repeat(location.difficulty)}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="opacity: 0.8;">Уровни ботов:</span>
                            <span style="color: #FF5252; font-weight: bold;">${location.botMinLevel}-${location.botMaxLevel}</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="opacity: 0.8;">Реком. уровень:</span>
                            <span style="color: ${playerLevel >= location.minLevel ? '#4CAF50' : '#FF9800'};">${location.minLevel}+</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="opacity: 0.8;">Ветер:</span>
                            <span style="color: #4FC3F7;">${Math.round(location.windStrength * 100)}%</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between;">
                            <span style="opacity: 0.8;">Состояние трассы:</span>
                            <span style="color: #4FC3F7;">${Math.round(location.trackCondition * 100)}%</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 10px; border-radius: 8px; background: rgba(255,255,255,0.1);">
                        <div style="display: flex; justify-content: space-between; font-size: 0.9em;">
                            <span>Ваш уровень:</span>
                            <span style="color: #4FC3F7; font-weight: bold;">${playerLevel}</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.2); border-radius: 3px; margin-top: 5px; overflow: hidden;">
                            <div style="height: 100%; background: ${this.getLevelColor(playerLevel, location.minLevel, location.maxLevel)}; width: ${Math.min(100, (playerLevel / location.maxLevel) * 100)}%; border-radius: 3px;"></div>
                        </div>
                    </div>
                    
                    ${playerLevel < location.minLevel ? 
                        '<div style="background: rgba(255,152,0,0.3); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 0.8em;">⚠️ Сложновато для вашего уровня</div>' : 
                        (playerLevel <= location.maxLevel ? 
                            '<div style="background: rgba(76,175,80,0.3); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 0.8em;">🎯 Идеально для вашего уровня</div>' :
                            '<div style="background: rgba(33,150,243,0.3); padding: 8px; border-radius: 8px; margin-top: 10px; font-size: 0.8em;">💪 Вы переросли эту локацию</div>')
                    }
                </div>
            `;
        }).join('');
    }
    
    getLevelColor(playerLevel, minLevel, maxLevel) {
        if (playerLevel < minLevel) return '#FF9800';
        if (playerLevel <= maxLevel) return '#4CAF50';
        return '#2196F3';
    }

    // Выбор локации
    selectLocation(locationId) {
        if (window.biathlonGame) {
            const success = window.biathlonGame.setLocation(locationId);
            if (success) {
                const location = window.biathlonGame.getCurrentLocation();
                this.showMessage(
                    `Локация изменена: ${location.name}\nУровни ботов: ${location.botMinLevel}-${location.botMaxLevel}`, 
                    "success"
                );
                
                // Обновляем соперников для выбранной гонки
                if (this.selectedRaceType) {
                    window.biathlonGame.initializeRace(this.selectedRaceType, locationId);
                }
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
                background: rgba(0,0,0,0.9);
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
                ">
                    <h2 style="color: #FFD700; margin-bottom: 20px;">⚙️ Настройки игры</h2>
                    
                    <div style="text-align: left; margin-bottom: 25px;">
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">🎯 Новая система гонок</h3>
                            <p>• <strong>Непрерывное движение</strong> - реалистичный расчет дистанции и времени</p>
                            <p>• <strong>7 уровней интенсивности</strong> - от восстановления до спринта</p>
                            <p>• <strong>Реальное время стрельбы</strong> - зависит от характеристик игрока</p>
                            <p>• <strong>Система выносливости</strong> - ограничивает использование спринта</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">🏁 Типы гонок</h3>
                            <p>• <strong>Спринт</strong>: 3 круга × 3300м = 9.9 км, 2 стрельбы</p>
                            <p>• <strong>Гонка преследования</strong>: 5 кругов × 2500м = 12.5 км, 4 стрельбы</p>
                            <p>• <strong>Масс-старт</strong>: 5 кругов × 3000м = 15 км, 4 стрельбы</p>
                            <p>• <strong>Индивидуальная</strong>: 5 кругов × 4000м = 20 км, 4 стрельбы</p>
                        </div>
                        
                        <div style="margin-bottom: 20px;">
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">🎮 Управление</h3>
                            <p>• <strong>Спринт</strong>: кнопка "💨 Спринт!" (требует ≥50% выносливости)</p>
                            <p>• <strong>Медленный темп</strong>: кнопка "🐢 Снизить темп" (восстанавливает выносливость)</p>
                            <p>• <strong>Пауза</strong>: кнопка "⚙️ Меню" во время гонки</p>
                            <p>• <strong>Характеристики</strong>: раздел "👤 Персонаж" для прокачки</p>
                        </div>
                        
                        <div>
                            <h3 style="color: #4FC3F7; margin-bottom: 10px;">📊 Система характеристик</h3>
                            <p>• <strong>Скорость бега</strong>: 16-28 км/ч (4.44-7.78 м/с)</p>
                            <p>• <strong>Меткость</strong>: 50-95% точность стрельбы</p>
                            <p>• <strong>Скорость стрельбы</strong>: 6-3 секунды между выстрелами</p>
                            <p>• <strong>Выносливость</strong>: 60-150 единиц максимальной выносливости</p>
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
            case 'warning':
                messageDiv.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
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
            
            // Обновляем информацию при показе меню
            this.updateRaceCards();
            if (this.selectedRaceType) {
                this.updateRecommendedStats(this.selectedRaceType);
            }
            
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
        return this.selectedRaceType;
    }
    
    // Обновление при изменении характеристик игрока
    refresh() {
        if (this.selectedRaceType) {
            this.updateRecommendedStats(this.selectedRaceType);
        }
    }
}
