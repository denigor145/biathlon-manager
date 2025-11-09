class CharacterScreen {
    constructor() {
        this.currentTab = 'stats';
        this.isInitialized = false;
        
        console.log("CharacterScreen создан");
        
        setTimeout(() => {
            this.initialize();
        }, 100);
    }
    
    initialize() {
        if (this.isInitialized) return;
        
        console.log("Инициализация CharacterScreen...");
        
        try {
            this.setupEventListeners();
            this.setupTabs();
            this.updateStatsDisplay();
            this.isInitialized = true;
            
            console.log("CharacterScreen успешно инициализирован");
        } catch (error) {
            console.error("Ошибка инициализации CharacterScreen:", error);
        }
    }
    
    setupEventListeners() {
        const backBtn = document.getElementById('backToMenuBtn');
        if (backBtn) {
            backBtn.addEventListener('click', () => {
                this.hide();
            });
        }
        
        document.querySelectorAll('.stat-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stat = e.target.closest('.stat-btn').getAttribute('data-stat');
                this.increaseStat(stat);
            });
        });
        
        document.querySelectorAll('.stat-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const stat = e.target.closest('.stat-btn').getAttribute('data-stat');
                this.decreaseStat(stat);
            });
        });
        
        const resetBtn = document.getElementById('resetStatsBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetStats();
            });
        }
        
        const saveBtn = document.getElementById('saveStatsBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveStats();
            });
        }
        
        console.log("Обработчики CharacterScreen установлены");
    }
    
    setupTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.getAttribute('data-tab');
                this.switchTab(tabName);
            });
        });
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const activeTabBtn = document.querySelector(`.tab-btn[data-tab="${tabName}"]`);
        const activeTabPane = document.getElementById(`${tabName}-tab`);
        
        if (activeTabBtn && activeTabPane) {
            activeTabBtn.classList.add('active');
            activeTabPane.classList.add('active');
            this.currentTab = tabName;
            
            console.log(`Переключена вкладка: ${tabName}`);
        }
    }
    
    increaseStat(statName) {
        if (!window.playerProfile) {
            console.error("PlayerProfile не найден");
            return;
        }
        
        const success = window.playerProfile.increaseStat(statName);
        
        if (success) {
            this.animateStatChange(statName, 'increase');
            this.updateButtonStates();
        } else {
            this.showMessage("Недостаточно очков для улучшения!", "error");
        }
    }
    
    decreaseStat(statName) {
        if (!window.playerProfile) {
            console.error("PlayerProfile не найден");
            return;
        }
        
        const success = window.playerProfile.decreaseStat(statName);
        
        if (success) {
            this.animateStatChange(statName, 'decrease');
            this.updateButtonStates();
        } else {
            this.showMessage("Характеристика уже минимальная!", "error");
        }
    }
    
    animateStatChange(statName, direction) {
        const valueElement = document.getElementById(`${statName}Value`);
        if (!valueElement) return;
        
        valueElement.classList.add(direction === 'increase' ? 'increased' : 'decreased');
        
        setTimeout(() => {
            valueElement.classList.remove('increased', 'decreased');
        }, 300);
    }
    
    updateStatsDisplay() {
        if (!window.playerProfile) {
            console.error("PlayerProfile не найден для обновления UI");
            return;
        }
        
        const pointsElement = document.getElementById('availablePoints');
        if (pointsElement) {
            pointsElement.textContent = window.playerProfile.getAvailablePoints();
            
            if (window.playerProfile.getAvailablePoints() === 0) {
                pointsElement.style.color = '#FF5252';
            } else {
                pointsElement.style.color = '#FFD700';
            }
        }
        
        const stats = window.playerProfile.getAllStats();
        
        for (const statName in stats) {
            const valueElement = document.getElementById(`${statName}Value`);
            if (valueElement) {
                valueElement.textContent = window.playerProfile.getFormattedStat(statName);
            }
        }
        
        this.updateButtonStates();
        
        console.log("Статистика обновлена в UI");
    }
    
    updateButtonStates() {
        if (!window.playerProfile) return;
        
        document.querySelectorAll('.stat-btn').forEach(btn => {
            const statName = btn.getAttribute('data-stat');
            const isPlus = btn.classList.contains('plus');
            
            if (isPlus) {
                btn.disabled = !window.playerProfile.canIncrease(statName);
            } else {
                btn.disabled = !window.playerProfile.canDecrease(statName);
            }
            
            if (btn.disabled) {
                btn.style.opacity = '0.5';
                btn.style.cursor = 'not-allowed';
            } else {
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            }
        });
    }
    
    resetStats() {
        if (!window.playerProfile) return;
        
        if (confirm("Вы уверены, что хотите сбросить все характеристики? Все распределенные очки будут возвращены.")) {
            window.playerProfile.resetStats();
            this.updateStatsDisplay();
            this.showMessage("Характеристики сброшены!", "success");
        }
    }
    
    saveStats() {
        if (!window.playerProfile) return;
        
        window.playerProfile.saveToStorage();
        
        if (window.biathlonGame && window.biathlonGame.player) {
            window.playerProfile.applyToGamePlayer(window.biathlonGame.player);
        }
        
        this.showMessage("Характеристики сохранены и применены!", "success");
        
        // Показываем информацию о текущем уровне и рекомендациях
        const playerLevel = window.playerProfile.getPlayerLevel();
        const currentLocation = window.biathlonGame.getCurrentLocation();
        
        let recommendationMessage = `Ваш уровень: ${playerLevel}\n`;
        recommendationMessage += `Текущая локация: ${currentLocation.name}\n`;
        recommendationMessage += `Уровни ботов: ${currentLocation.botMinLevel}-${currentLocation.botMaxLevel}\n\n`;
        
        if (playerLevel < currentLocation.minLevel) {
            recommendationMessage += `⚠️  Эта локация может быть сложной для вашего уровня.\n`;
            recommendationMessage += `Рекомендуемый уровень: ${currentLocation.minLevel}+`;
        } else if (playerLevel >= currentLocation.minLevel && playerLevel <= currentLocation.maxLevel) {
            recommendationMessage += `🎯  Эта локация идеально подходит для вашего уровня!`;
        } else {
            recommendationMessage += `💪  Вы переросли эту локацию! Попробуйте более сложные.`;
        }
        
        setTimeout(() => {
            if (confirm(recommendationMessage + "\n\nХотите перейти к выбору локаций?")) {
                if (window.mainMenu) {
                    window.mainMenu.showLocationSelection();
                }
            }
        }, 500);
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
        const characterScreen = document.getElementById('characterScreen');
        const mainMenu = document.getElementById('mainMenu');
        
        if (characterScreen && mainMenu) {
            mainMenu.classList.remove('active');
            characterScreen.classList.add('active');
            
            this.updateStatsDisplay();
            
            console.log("CharacterScreen показан");
        } else {
            console.error("Не удалось найти элементы экрана характеристик");
        }
    }
    
    hide() {
        const characterScreen = document.getElementById('characterScreen');
        const mainMenu = document.getElementById('mainMenu');
        
        if (characterScreen && mainMenu) {
            characterScreen.classList.remove('active');
            mainMenu.classList.add('active');
            
            console.log("CharacterScreen скрыт");
        }
    }
    
    refresh() {
        this.updateStatsDisplay();
    }
    
    getCurrentTab() {
        return this.currentTab;
    }
    
    isReady() {
        return this.isInitialized;
    }
}
