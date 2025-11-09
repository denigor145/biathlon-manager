class CharacterScreen {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'stats';
        
        console.log("CharacterScreen создан для непрерывной системы");
        
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        console.log("Инициализация CharacterScreen для непрерывной системы...");
        
        try {
            this.setupEventListeners();
            this.setupTabs();
            this.createStatsDisplay();
            this.isInitialized = true;
            
            console.log("CharacterScreen успешно инициализирован для непрерывной системы");
        } catch (error) {
            console.error("Ошибка инициализации CharacterScreen:", error);
        }
    }
    
    setupEventListeners() {
        // Кнопка возврата в меню
        const backBtn = document.getElementById('characterBackBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.hide();
                if (window.mainMenu) {
                    window.mainMenu.show();
                }
            });
        }
        
        // Кнопки управления характеристиками будут созданы динамически
        console.log("Обработчики CharacterScreen установлены для непрерывной системы");
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.char-tab');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        // Скрываем все вкладки
        document.querySelectorAll('.char-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Убираем активность со всех кнопок вкладок
        document.querySelectorAll('.char-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Показываем выбранную вкладку
        const targetContent = document.getElementById(`${tabName}Tab`);
        const targetButton = document.querySelector(`.char-tab[data-tab="${tabName}"]`);
        
        if (targetContent && targetButton) {
            targetContent.classList.add('active');
            targetButton.classList.add('active');
            this.currentTab = tabName;
            
            // Обновляем содержимое вкладки при переключении
            if (tabName === 'stats') {
                this.updateStatsDisplay();
            } else if (tabName === 'progress') {
                this.updateProgressDisplay();
            } else if (tabName === 'achievements') {
                this.updateAchievementsDisplay();
            }
        }
    }
    
    createStatsDisplay() {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
        const stats = [
            {
                id: 'runningSpeed',
                name: '🏃 Скорость бега',
                description: 'Влияет на базовую скорость движения (4.44-7.78 м/с)',
                icon: '⚡'
            },
            {
                id: 'accuracy', 
                name: '🎯 Меткость',
                description: 'Влияет на точность стрельбы лёжа и стоя',
                icon: '🎯'
            },
            {
                id: 'shootingSpeed',
                name: '🔫 Скорость стрельбы',
                description: 'Влияет на время между выстрелами (6-3 секунды)',
                icon: '⏱️'
            },
            {
                id: 'stamina',
                name: '💪 Выносливость',
                description: 'Влияет на максимальную выносливость (60-150)',
                icon: '❤️'
            }
        ];
        
        statsContainer.innerHTML = stats.map(stat => `
            <div class="stat-card" data-stat="${stat.id}">
                <div class="stat-header">
                    <div class="stat-icon">${stat.icon}</div>
                    <div class="stat-info">
                        <h3>${stat.name}</h3>
                        <p>${stat.description}</p>
                    </div>
                </div>
                
                <div class="stat-controls">
                    <button class="stat-btn decrease-btn" data-stat="${stat.id}">
                        <span>-</span>
                    </button>
                    
                    <div class="stat-value-container">
                        <div class="stat-current" id="${stat.id}Value">0</div>
                        <div class="stat-bar">
                            <div class="stat-bar-fill" id="${stat.id}Bar" style="width: 0%"></div>
                        </div>
                        <div class="stat-max">/ 60</div>
                    </div>
                    
                    <button class="stat-btn increase-btn" data-stat="${stat.id}">
                        <span>+</span>
                    </button>
                </div>
                
                <div class="stat-preview" id="${stat.id}Preview">
                    <!-- Динамическое содержимое предпросмотра -->
                </div>
            </div>
        `).join('');
        
        // Добавляем обработчики для кнопок
        this.setupStatButtons();
    }
    
    setupStatButtons() {
        // Обработчики для кнопок увеличения
        document.querySelectorAll('.increase-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const statName = e.currentTarget.getAttribute('data-stat');
                this.increaseStat(statName);
            });
        });
        
        // Обработчики для кнопок уменьшения
        document.querySelectorAll('.decrease-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const statName = e.currentTarget.getAttribute('data-stat');
                this.decreaseStat(statName);
            });
        });
    }
    
    increaseStat(statName) {
        if (!window.playerProfile) {
            console.error("PlayerProfile не доступен");
            return;
        }
        
        const success = window.playerProfile.increaseStat(statName);
        if (success) {
            this.updateStatsDisplay();
            this.showStatChangeMessage(statName, 'increase');
        }
    }
    
    decreaseStat(statName) {
        if (!window.playerProfile) {
            console.error("PlayerProfile не доступен");
            return;
        }
        
        const success = window.playerProfile.decreaseStat(statName);
        if (success) {
            this.updateStatsDisplay();
            this.showStatChangeMessage(statName, 'decrease');
        }
    }
    
    showStatChangeMessage(statName, type) {
        const statNames = {
            runningSpeed: 'Скорость бега',
            accuracy: 'Меткость',
            shootingSpeed: 'Скорость стрельбы',
            stamina: 'Выносливость'
        };
        
        const message = type === 'increase' 
            ? `📈 ${statNames[statName]} улучшена!`
            : `📉 ${statNames[statName]} уменьшена!`;
            
        this.showMessage(message, type === 'increase' ? 'success' : 'warning');
    }
    
    // Основное обновление отображения характеристик
    updateStatsDisplay() {
        if (!window.playerProfile) return;
        
        const profile = window.playerProfile;
        const stats = profile.getAllStats();
        const availablePoints = profile.getAvailablePoints();
        
        // Обновляем доступные очки
        this.updateElement('availablePoints', availablePoints);
        
        // Обновляем каждую характеристику
        Object.keys(stats).forEach(statName => {
            this.updateStatDisplay(statName, stats[statName]);
        });
        
        // Обновляем предпросмотр характеристик
        this.updateStatsPreview();
        
        // Обновляем кнопки управления
        this.updateControlButtons();
        
        // Обновляем общую информацию
        this.updateSummaryInfo();
    }
    
    updateStatDisplay(statName, value) {
        // Обновляем числовое значение
        this.updateElement(statName + 'Value', value);
        
        // Обновляем прогресс-бар
        const bar = document.getElementById(statName + 'Bar');
        if (bar) {
            const percentage = (value / 60) * 100;
            bar.style.width = percentage + '%';
            
            // Цвет в зависимости от уровня
            if (percentage >= 80) bar.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
            else if (percentage >= 60) bar.style.background = 'linear-gradient(135deg, #8BC34A, #689F38)';
            else if (percentage >= 40) bar.style.background = 'linear-gradient(135deg, #FFC107, #FFA000)';
            else if (percentage >= 20) bar.style.background = 'linear-gradient(135deg, #FF9800, #F57C00)';
            else bar.style.background = 'linear-gradient(135deg, #F44336, #C62828)';
        }
        
        // Обновляем состояние кнопок
        this.updateStatButtons(statName);
    }
    
    updateStatButtons(statName) {
        if (!window.playerProfile) return;
        
        const increaseBtn = document.querySelector(`.increase-btn[data-stat="${statName}"]`);
        const decreaseBtn = document.querySelector(`.decrease-btn[data-stat="${statName}"]`);
        
        if (increaseBtn) {
            const canIncrease = window.playerProfile.canIncrease(statName);
            increaseBtn.disabled = !canIncrease;
            increaseBtn.style.opacity = canIncrease ? '1' : '0.5';
            increaseBtn.style.cursor = canIncrease ? 'pointer' : 'not-allowed';
        }
        
        if (decreaseBtn) {
            const canDecrease = window.playerProfile.canDecrease(statName);
            decreaseBtn.disabled = !canDecrease;
            decreaseBtn.style.opacity = canDecrease ? '1' : '0.5';
            decreaseBtn.style.cursor = canDecrease ? 'pointer' : 'not-allowed';
        }
    }
    
    updateStatsPreview() {
        if (!window.playerProfile) return;
        
        const progressInfo = window.playerProfile.getProgressInfo();
        
        const stats = ['runningSpeed', 'accuracy', 'shootingSpeed', 'stamina'];
        stats.forEach(statName => {
            const previewElement = document.getElementById(statName + 'Preview');
            if (!previewElement) return;
            
            let previewHTML = '';
            
            switch(statName) {
                case 'runningSpeed':
                    previewHTML = `
                        <div class="preview-item">
                            <span class="preview-label">Текущая скорость:</span>
                            <span class="preview-value">${progressInfo.speed}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Время круга (3км):</span>
                            <span class="preview-value">${progressInfo.lapTime}</span>
                        </div>
                    `;
                    break;
                    
                case 'accuracy':
                    previewHTML = `
                        <div class="preview-item">
                            <span class="preview-label">Меткость лёжа:</span>
                            <span class="preview-value">${progressInfo.accuracyProne}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Меткость стоя:</span>
                            <span class="preview-value">${progressInfo.accuracyStanding}</span>
                        </div>
                    `;
                    break;
                    
                case 'shootingSpeed':
                    previewHTML = `
                        <div class="preview-item">
                            <span class="preview-label">Интервал выстрелов:</span>
                            <span class="preview-value">${progressInfo.shootingTime.split(' ')[0]}/выстрел</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Время стрельбы (5 выстр.):</span>
                            <span class="preview-value">${progressInfo.shootingTime}</span>
                        </div>
                    `;
                    break;
                    
                case 'stamina':
                    previewHTML = `
                        <div class="preview-item">
                            <span class="preview-label">Макс. выносливость:</span>
                            <span class="preview-value">${progressInfo.maxStamina}</span>
                        </div>
                        <div class="preview-item">
                            <span class="preview-label">Восстановление:</span>
                            <span class="preview-value">${(GameConstants.PLAYER.STAMINA_RECOVERY_RATE * (window.playerProfile.getStat('stamina') / 60 + 1)).toFixed(1)}/сек</span>
                        </div>
                    `;
                    break;
            }
            
            previewElement.innerHTML = previewHTML;
        });
    }
    
    updateControlButtons() {
        if (!window.playerProfile) return;
        
        const resetBtn = document.getElementById('resetStatsBtn');
        if (resetBtn) {
            // Разрешаем сброс только если есть потраченные очки
            const hasSpentPoints = window.playerProfile.getAvailablePoints() < GameConstants.STATS.STARTING_POINTS;
            resetBtn.disabled = !hasSpentPoints;
            
            if (resetBtn.disabled) {
                resetBtn.style.opacity = '0.5';
                resetBtn.style.cursor = 'not-allowed';
            } else {
                resetBtn.style.opacity = '1';
                resetBtn.style.cursor = 'pointer';
            }
            
            // Обновляем обработчик
            resetBtn.onclick = () => {
                this.resetStats();
            };
        }
    }
    
    resetStats() {
        if (!window.playerProfile) return;
        
        const confirmation = confirm("Вы уверены, что хотите сбросить все характеристики? Все очки будут возвращены.");
        
        if (confirmation) {
            window.playerProfile.resetStats();
            this.updateStatsDisplay();
            this.showMessage("♻️ Все характеристики сброшены!", "success");
        }
    }
    
    updateSummaryInfo() {
        if (!window.playerProfile) return;
        
        const profile = window.playerProfile;
        const progressInfo = profile.getProgressInfo();
        const playerLevel = profile.getPlayerLevel();
        
        // Обновляем уровень игрока
        this.updateElement('playerLevel', playerLevel);
        
        // Обновляем сводку характеристик
        const summaryElement = document.getElementById('statsSummary');
        if (summaryElement) {
            summaryElement.innerHTML = `
                <div class="summary-grid">
                    <div class="summary-item">
                        <div class="summary-label">Общий уровень</div>
                        <div class="summary-value">${playerLevel}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Скорость</div>
                        <div class="summary-value">${progressInfo.speed}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Время круга</div>
                        <div class="summary-value">${progressInfo.lapTime}</div>
                    </div>
                    <div class="summary-item">
                        <div class="summary-label">Время стрельбы</div>
                        <div class="summary-value">${progressInfo.shootingTime}</div>
                    </div>
                </div>
            `;
        }
    }
    
    updateProgressDisplay() {
        if (!window.raceManager) return;
        
        const stats = window.raceManager.getRaceStatistics();
        const progress = window.raceManager.getRaceTypeProgress();
        const timeline = window.raceManager.getProgressTimeline();
        
        const progressContainer = document.getElementById('progressContainer');
        if (!progressContainer) return;
        
        let progressHTML = `
            <div class="progress-stats-grid">
                <div class="progress-stat-card">
                    <div class="progress-stat-value">${stats.totalRaces}</div>
                    <div class="progress-stat-label">Всего гонок</div>
                </div>
                <div class="progress-stat-card">
                    <div class="progress-stat-value">${stats.victories}</div>
                    <div class="progress-stat-label">Побед</div>
                </div>
                <div class="progress-stat-card">
                    <div class="progress-stat-value">${stats.podiums}</div>
                    <div class="progress-stat-label">Подиумов</div>
                </div>
                <div class="progress-stat-card">
                    <div class="progress-stat-value">${stats.winRate}%</div>
                    <div class="progress-stat-label">Процент побед</div>
                </div>
            </div>
            
            <div class="progress-details">
                <h3>📊 Статистика по дистанциям</h3>
        `;
        
        // Добавляем прогресс по типам гонок
        Object.keys(progress).forEach(raceType => {
            const raceProgress = progress[raceType];
            progressHTML += `
                <div class="race-progress-item">
                    <div class="race-progress-header">
                        <span class="race-name">${raceProgress.name}</span>
                        <span class="race-stats">${raceProgress.completed} гонок, ${raceProgress.victories} побед</span>
                    </div>
                    <div class="race-progress-bar">
                        <div class="race-progress-fill" style="width: ${Math.min(100, (raceProgress.completed / 10) * 100)}%"></div>
                    </div>
                    <div class="race-progress-details">
                        <span>Лучшее время: ${raceProgress.bestTimeFormatted}</span>
                        <span>Лучшая позиция: ${raceProgress.bestPosition || '-'}</span>
                    </div>
                </div>
            `;
        });
        
        progressHTML += `</div>`;
        
        progressContainer.innerHTML = progressHTML;
    }
    
    updateAchievementsDisplay() {
        if (!window.raceManager) return;
        
        const achievements = window.raceManager.getAchievements();
        const analytics = window.raceManager.getImprovementAnalytics();
        
        const achievementsContainer = document.getElementById('achievementsContainer');
        if (!achievementsContainer) return;
        
        let achievementsHTML = `
            <div class="analytics-section">
                <h3>📈 Аналитика эффективности</h3>
                <div class="analytics-card">
                    <div class="analytics-score">
                        <div class="score-value">${analytics.overallEfficiency}%</div>
                        <div class="score-label">Общая эффективность</div>
                    </div>
                    
                    ${analytics.strengths.length > 0 ? `
                        <div class="analytics-strengths">
                            <h4>💪 Сильные стороны</h4>
                            <ul>
                                ${analytics.strengths.map(strength => `<li>${strength}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${analytics.improvements.length > 0 ? `
                        <div class="analytics-improvements">
                            <h4>🎯 Области для улучшения</h4>
                            <ul>
                                ${analytics.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${analytics.recommendations.length > 0 ? `
                        <div class="analytics-recommendations">
                            <h4>💡 Рекомендации</h4>
                            <ul>
                                ${analytics.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <div class="achievements-section">
                <h3>🏆 Достижения</h3>
                <div class="achievements-grid">
        `;
        
        if (achievements.length === 0) {
            achievementsHTML += `
                <div class="no-achievements">
                    <p>🎯 Достижения появятся после первых гонок!</p>
                    <p>Участвуйте в гонках и побеждайте, чтобы открывать достижения.</p>
                </div>
            `;
        } else {
            achievements.forEach(achievement => {
                achievementsHTML += `
                    <div class="achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}">
                        <div class="achievement-icon">${achievement.icon}</div>
                        <div class="achievement-info">
                            <h4>${achievement.name}</h4>
                            <p>${achievement.description}</p>
                        </div>
                        <div class="achievement-status">
                            ${achievement.unlocked ? '✅' : '🔒'}
                        </div>
                    </div>
                `;
            });
        }
        
        achievementsHTML += `</div></div>`;
        achievementsContainer.innerHTML = achievementsHTML;
    }
    
    // Вспомогательные методы
    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%);
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: bold;
            z-index: 10000;
            transition: all 0.3s ease;
            max-width: 80%;
            text-align: center;
            font-size: 14px;
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
        const characterScreen = document.getElementById('characterScreen');
        if (characterScreen) {
            document.querySelectorAll('.screen').forEach(screen => {
                screen.classList.remove('active');
            });
            characterScreen.classList.add('active');
            
            // Обновляем отображение при показе
            this.updateStatsDisplay();
            this.switchTab(this.currentTab);
            
            console.log("CharacterScreen показан");
        }
    }
    
    hide() {
        const characterScreen = document.getElementById('characterScreen');
        if (characterScreen) {
            characterScreen.classList.remove('active');
            console.log("CharacterScreen скрыт");
        }
    }
    
    isReady() {
        return this.isInitialized;
    }
}
