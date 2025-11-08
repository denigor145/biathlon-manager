class BiathlonGame {
    constructor() {
        // Типы гонок с обновленными параметрами
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                distance: "7.65 км",
                totalLaps: 3,
                segmentsPerLap: 17,
                totalSegments: 51,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа" },
                    { afterLap: 2, position: "standing", name: "Стрельба стоя" }
                ],
                description: "Короткая быстрая гонка с 2 стрельбами"
            },
            pursuit: {
                name: "Гонка преследования",
                distance: "8.4 км",
                totalLaps: 4,
                segmentsPerLap: 14,
                totalSegments: 56,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Средняя дистанция с 4 стрельбами"
            },
            mass: {
                name: "Масс-старт",
                distance: "12.75 км",
                totalLaps: 5,
                segmentsPerLap: 17,
                totalSegments: 85,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 3, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Длинная дистанция с 4 стрельбами"
            },
            individual: {
                name: "Индивидуальная гонка",
                distance: "15 км",
                totalLaps: 5,
                segmentsPerLap: 20,
                totalSegments: 100,
                shootingRounds: [
                    { afterLap: 1, position: "prone", name: "Стрельба лёжа 1" },
                    { afterLap: 2, position: "standing", name: "Стрельба стоя 1" },
                    { afterLap: 3, position: "prone", name: "Стрельба лёжа 2" },
                    { afterLap: 4, position: "standing", name: "Стрельба стоя 2" }
                ],
                description: "Самая длинная дистанция с 4 стрельбами"
            }
        };

        // Текущее состояние игры
        this.selectedRaceType = "sprint";
        this.currentRaceType = "sprint";
        this.isRacing = false;
        this.isShooting = false;
        this.raceInterval = null;
        
        // Состояние гонки
        this.raceStartTime = 0;
        this.realTimeElapsed = 0;
        
        // Система локаций
        this.locations = [
            { id: 0, name: "Новичковый стадион", minLevel: 0, maxLevel: 9, difficulty: 1 },
            { id: 1, name: "Горный курорт", minLevel: 10, maxLevel: 19, difficulty: 2 },
            { id: 2, name: "Лесная трасса", minLevel: 20, maxLevel: 29, difficulty: 3 },
            { id: 3, name: "Альпийский центр", minLevel: 30, maxLevel: 39, difficulty: 4 },
            { id: 4, name: "Северный полюс", minLevel: 40, maxLevel: 49, difficulty: 5 },
            { id: 5, name: "Олимпийский комплекс", minLevel: 50, maxLevel: 59, difficulty: 6 },
            { id: 6, name: "Мировой кубок", minLevel: 60, maxLevel: 69, difficulty: 7 },
            { id: 7, name: "Чемпионат мира", minLevel: 70, maxLevel: 79, difficulty: 8 },
            { id: 8, name: "Элитная лига", minLevel: 80, maxLevel: 89, difficulty: 9 },
            { id: 9, name: "Легендарная арена", minLevel: 90, maxLevel: 99, difficulty: 10 }
        ];
        
        this.currentLocation = 0;
        
        // Инициализация игрока (базовые значения)
        this.player = this.createPlayer();
        
        // Генерируем соперников
        this.opponents = this.generateOpponents(16);
        this.allCompetitors = [this.player, ...this.opponents];
        
        // Состояние стрельбы
        this.shootingParticipants = new Map();
        this.allShootingResults = new Map();
        
        console.log("Биатлон Менеджер инициализирован с новой системой!");
    }
    
    // Создание игрока
    createPlayer() {
        return {
            id: 'player',
            name: "Вы",
            flag: "🎯",
            speedMps: 2.78, // Будет перезаписано характеристиками
            stamina: 60,
            maxStamina: 60,
            pulse: 120,
            position: 1,
            totalGameTime: 0,
            completedSegments: 0,
            currentLap: 1,
            completedSegmentsInCurrentLap: 0,
            isPlayer: true,
            isRacing: false,
            isShooting: false,
            hasShotThisLap: false, // Новое поле для предотвращения повторной стрельбы
            shooting: {
                prone: 0.1,
                standing: 0.1
            },
            shootingSpeed: 6,
            level: 0,
            // Система штрафов
            penaltyMinutes: 0,
            extraSegmentsPerLap: {},
            // Текущая стрельба
            currentShooting: null,
            shootingResults: [],
            shotsFired: 0,
            shootingStartTime: 0
        };
    }
    
    // Генерация соперников
    generateOpponents(count) {
        const opponents = [];
        const names = [
            "Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", 
            "Бё", "Фуркад", "Самуэльссон", "Семёнов", "Пидно",
            "Уле", "Бьорндален", "Ландертингер", "Ферри", "Вайдель", "Логинов"
        ];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹", "🇨🇭", "🇷🇺", "🇺🇦", "🇨🇿", "🇸🇰", "🇧🇾", "🇰🇿", "🇨🇦", "🇺🇸"];
        
        for (let i = 0; i < count; i++) {
            const level = Math.floor(Math.random() * 60); // Уровень от 0 до 59
            
            // Скорость от 2.78 до 5 м/с в зависимости от уровня
            const speedMps = 2.78 + (level * (5 - 2.78) / 60);
            
            // Точность от 10% до 80%
            const accuracy = 0.1 + (level * 0.7 / 60);
            
            // Скорость стрельбы от 6 до 3 секунд
            const shootingSpeed = 6 - (level * 3 / 60);
            
            opponents.push({
                id: 'ai_' + i,
                name: `${names[i]}`,
                flag: flags[i % flags.length],
                speedMps: speedMps,
                stamina: 60 + (level * 90 / 60),
                maxStamina: 60 + (level * 90 / 60),
                pulse: 110 + Math.random() * 30,
                position: i + 2,
                totalGameTime: i * 2, // Разное стартовое время
                completedSegments: 0,
                currentLap: 1,
                completedSegmentsInCurrentLap: 0,
                isPlayer: false,
                isRacing: false,
                isShooting: false,
                hasShotThisLap: false, // Новое поле для предотвращения повторной стрельбы
                shooting: {
                    prone: Math.min(0.95, accuracy * 1.1),
                    standing: Math.min(0.85, accuracy * 0.9)
                },
                shootingSpeed: shootingSpeed,
                level: level,
                // Система штрафов
                penaltyMinutes: 0,
                extraSegmentsPerLap: {},
                // Текущая стрельба
                currentShooting: null,
                shootingResults: [],
                shotsFired: 0,
                shootingStartTime: 0,
                // Характеристики AI
                aggression: 0.5 + Math.random() * 0.5,
                consistency: 0.7 + Math.random() * 0.3
            });
        }
        
        return opponents;
    }
    
    // Выбор типа гонки
    selectRaceType(raceType) {
        if (this.raceTypes[raceType]) {
            this.selectedRaceType = raceType;
            console.log(`Выбрана гонка: ${this.raceTypes[raceType].name}`);
            return true;
        }
        return false;
    }
    
    getSelectedRace() {
        return this.raceTypes[this.selectedRaceType];
    }
    
    getCurrentRace() {
        return this.raceTypes[this.currentRaceType];
    }
    
    // Установка локации
    setLocation(locationId) {
        if (locationId >= 0 && locationId < this.locations.length) {
            this.currentLocation = locationId;
            console.log(`Переключена локация: ${this.locations[locationId].name}`);
            return true;
        }
        return false;
    }
    
    getCurrentLocation() {
        return this.locations[this.currentLocation];
    }
    
    // Запуск гонки
    startRace(raceType = null) {
        console.log("=== START RACE ===");
        
        if (raceType) {
            this.selectedRaceType = raceType;
        }
        
        this.currentRaceType = this.selectedRaceType;
        this.isRacing = false;
        this.isShooting = false;
        this.raceStartTime = 0;
        this.realTimeElapsed = 0;
        
        console.log("Параметры гонки установлены:", this.currentRaceType);
        
        // Применяем характеристики игрока
        this.applyPlayerCharacteristics();
        
        // Сбрасываем состояние всех участников
        this.resetCompetitors();
        
        if (window.gameScreen) {
            window.gameScreen.showStartStage();
        }
        
        return true;
    }
    
    // Применение характеристик игрока
    applyPlayerCharacteristics() {
        if (window.playerProfile && this.player) {
            window.playerProfile.applyToGamePlayer(this.player);
        }
    }
    
    // Сброс состояния участников
    resetCompetitors() {
        this.allCompetitors.forEach((competitor, index) => {
            competitor.totalGameTime = index * 0.5; // Разное стартовое время
            competitor.completedSegments = 0;
            competitor.currentLap = 1;
            competitor.completedSegmentsInCurrentLap = 0;
            competitor.isRacing = false;
            competitor.isShooting = false;
            competitor.hasShotThisLap = false; // Сбрасываем флаг стрельбы
            competitor.penaltyMinutes = 0;
            competitor.extraSegmentsPerLap = {};
            competitor.currentShooting = null;
            competitor.shootingResults = [];
            competitor.shotsFired = 0;
            competitor.shootingStartTime = 0;
            competitor.position = index + 1;
            competitor.stamina = competitor.maxStamina;
            competitor.pulse = 120;
        });
        
        // Сортируем по времени
        this.allCompetitors.sort((a, b) => a.totalGameTime - b.totalGameTime);
        this.updatePositions();
    }
    
    // Запуск гонки после экрана старта
    startRaceAfterStage() {
        this.isRacing = true;
        this.raceStartTime = Date.now();
        this.startRaceInterval();
        console.log("Гонка началась!");
        
        // Запускаем всех участников
        this.allCompetitors.forEach(competitor => {
            competitor.isRacing = true;
        });
        
        if (window.gameScreen) {
            window.gameScreen.hideStageScreen('startStageScreen');
            window.gameScreen.showScreen('gameScreen');
        }
    }
    
    // Запуск интервала гонки (2 секунды)
    startRaceInterval() {
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 2000); // Обновление каждые 2 секунды
    }
    
    // Основное обновление гонки
    updateRace() {
        if (!this.isRacing) return;
        
        this.realTimeElapsed = (Date.now() - this.raceStartTime) / 1000;
        
        // Обновляем всех участников, которые бегут (не стреляют)
        this.allCompetitors.forEach(competitor => {
            if (competitor.isRacing && !competitor.isShooting) {
                this.updateCompetitorMovement(competitor);
            }
        });
        
        // Обновляем позиции
        this.updatePositions();
        
        // Обновляем отображение
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
        
        // Проверяем завершение гонки
        this.checkRaceCompletion();
    }
    
    // Обновление движения участника - ИСПРАВЛЕННАЯ ВЕРСИЯ
    updateCompetitorMovement(competitor) {
        const race = this.getCurrentRace();
        
        // Проверяем, не завершил ли участник гонку
        if (competitor.currentLap > race.totalLaps) {
            competitor.isRacing = false;
            competitor.finished = true;
            return;
        }
        
        // Добавляем игровое время для текущего отрезка
        const segmentGameTime = this.calculateSegmentGameTime(competitor);
        competitor.totalGameTime += segmentGameTime;
        
        // Увеличиваем счетчик отрезков
        competitor.completedSegments++;
        competitor.completedSegmentsInCurrentLap++;
        
        // Проверяем завершение круга (учитывая штрафные отрезки)
        this.checkLapCompletion(competitor);
        
        // Проверяем, достигли ли стрельбища (только базовые отрезки)
        this.checkShootingPoint(competitor);
        
        // Обновляем физиологические показатели
        this.updatePhysiology(competitor);
    }
    
    // Расчет игрового времени для отрезка
    calculateSegmentGameTime(competitor) {
        // Базовое время = 150 / скорость (м/с)
        const baseTime = 150 / competitor.speedMps;
        
        // Случайное отклонение от -1 до +2 км/ч
        const randomVariation = (Math.random() * 3 - 1) / 3.6; // Переводим в м/с
        const variedSpeed = competitor.speedMps + randomVariation;
        
        // Финальное время с учетом случайного отклонения
        return 150 / Math.max(2.5, variedSpeed); // Минимальная скорость 2.5 м/с
    }
    
    // Проверка точки стрельбы (между кругами) - ИСПРАВЛЕННАЯ ВЕРСИЯ
    checkShootingPoint(competitor) {
        const race = this.getCurrentRace();
        const currentLap = competitor.currentLap;
        
        // Ищем стрельбу для текущего круга
        const shootingRound = race.shootingRounds.find(round => round.afterLap === currentLap);
        
        if (shootingRound && !competitor.isShooting && !competitor.hasShotThisLap) {
            // Стрельба происходит после прохождения БАЗОВОГО количества отрезков (без учета штрафных)
            const baseSegmentsInLap = race.segmentsPerLap;
            
            if (competitor.completedSegmentsInCurrentLap >= baseSegmentsInLap) {
                // Останавливаем движение и начинаем стрельбу
                competitor.isRacing = false;
                competitor.hasShotThisLap = true; // Предотвращаем повторную стрельбу
                this.startShooting(competitor, shootingRound);
            }
        }
    }
    
    // Проверка завершения круга - ИСПРАВЛЕННАЯ ВЕРСИЯ
    checkLapCompletion(competitor) {
        const race = this.getCurrentRace();
        const currentLap = competitor.currentLap;
        
        // Если это не последний круг и участник прошел все отрезки (базовые + штрафные)
        if (currentLap <= race.totalLaps) {
            const totalSegmentsInLap = race.segmentsPerLap + (competitor.extraSegmentsPerLap[currentLap] || 0);
            
            if (competitor.completedSegmentsInCurrentLap >= totalSegmentsInLap) {
                // Переходим на следующий круг
                competitor.currentLap++;
                competitor.completedSegmentsInCurrentLap = 0;
                competitor.hasShotThisLap = false; // Сбрасываем флаг стрельбы для нового круга
                
                console.log(`${competitor.name} перешел на круг ${competitor.currentLap}`);
            }
        }
    }
    
    // Обновление физиологических показателей
    updatePhysiology(competitor) {
        // Уменьшаем выносливость
        competitor.stamina = Math.max(0, competitor.stamina - 0.5);
        
        // Увеличиваем пульс
        competitor.pulse = Math.min(180, competitor.pulse + 0.3);
        
        // Восстановление выносливости при низком темпе
        if (competitor.speedMps < 3.5) {
            competitor.stamina = Math.min(competitor.maxStamina, competitor.stamina + 0.2);
            competitor.pulse = Math.max(100, competitor.pulse - 0.1);
        }
    }
    
    // Начало стрельбы - ИСПРАВЛЕННАЯ ВЕРСИЯ
    startShooting(competitor, shootingRound) {
        competitor.isShooting = true;
        competitor.currentShooting = shootingRound;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingStartTime = Date.now();
        
        console.log(`${competitor.name} начинает стрельбу: ${shootingRound.name}`);
        
        // Показываем экран стрельбы для игрока
        if (competitor.isPlayer && window.gameScreen) {
            window.gameScreen.showPreShootingStage(shootingRound);
        } else {
            // Для AI сразу начинаем процесс стрельбы
            this.processShooting(competitor);
        }
        
        // Обновляем отображение
        if (window.gameScreen) {
            window.gameScreen.updateDisplay();
        }
    }
    
    // Процесс стрельбы - ИСПРАВЛЕННАЯ ВЕРСИЯ
    processShooting(competitor) {
        if (competitor.shotsFired < 5 && competitor.isShooting) {
            // Делаем выстрел
            const isHit = this.makeShot(competitor);
            competitor.shootingResults.push(isHit);
            competitor.shotsFired++;
            
            console.log(`${competitor.name}: выстрел ${competitor.shotsFired} - ${isHit ? 'ПОПАДАНИЕ' : 'ПРОМАХ'}`);
            
            // Обновляем отображение
            if (window.gameScreen) {
                window.gameScreen.updateDisplay();
            }
            
            if (competitor.shotsFired < 5) {
                // Ждем перед следующим выстрелом
                const shotInterval = competitor.shootingSpeed * 1000; // в миллисекундах
                setTimeout(() => {
                    if (competitor.isShooting) { // Проверяем, что стрельба еще актуальна
                        this.processShooting(competitor);
                    }
                }, shotInterval);
            } else {
                // Завершаем стрельбу
                this.finishShooting(competitor);
            }
        }
    }
    
    // Совершение выстрела
    makeShot(competitor) {
        const shootingRound = competitor.currentShooting;
        const accuracy = competitor.shooting[shootingRound.position];
        
        // Случайное отклонение based on консистенции
        const consistency = competitor.consistency || 0.8;
        const effectiveAccuracy = accuracy * consistency;
        
        // Шанс попадания
        return Math.random() < effectiveAccuracy;
    }
    
    // Завершение стрельбы - ИСПРАВЛЕННАЯ ВЕРСИЯ
    finishShooting(competitor) {
        if (!competitor.isShooting) return;
        
        // Рассчитываем реальное время стрельбы
        const shootingRealTime = (Date.now() - competitor.shootingStartTime) / 1000;
        
        console.log(`${competitor.name} завершил стрельбу за ${shootingRealTime.toFixed(1)} секунд`);
        
        // Добавляем реальное время стрельбы к общему времени
        competitor.totalGameTime += shootingRealTime;
        
        // Подсчитываем промахи
        const misses = competitor.shootingResults.filter(result => !result).length;
        
        // Применяем штрафы
        this.applyShootingPenalty(competitor, misses);
        
        console.log(`${competitor.name}: ${5 - misses}/5, промахов: ${misses}`);
        
        // Сбрасываем состояние стрельбы
        competitor.isShooting = false;
        competitor.isRacing = true; // Возобновляем движение после стрельбы
        competitor.currentShooting = null;
        competitor.shootingResults = [];
        competitor.shotsFired = 0;
        competitor.shootingStartTime = 0;
        
        // Для игрока показываем экран результатов стрельбы
        if (competitor.isPlayer && window.gameScreen) {
            window.gameScreen.showPostShootingStage();
        } else {
            // Обновляем позиции после добавления времени стрельбы
            this.updatePositions();
            
            // Обновляем отображение
            if (window.gameScreen) {
                window.gameScreen.updateDisplay();
            }
        }
    }
    
    // Применение штрафов за стрельбу
    applyShootingPenalty(competitor, misses) {
        const race = this.getCurrentRace();
        
        if (this.currentRaceType === 'individual') {
            // Индивидуальная гонка: +1 минута за промах
            competitor.penaltyMinutes += misses;
            console.log(`${competitor.name}: +${misses} минут штрафа`);
        } else {
            // Остальные гонки: +1 отрезок за промах к следующему кругу
            const nextLap = competitor.currentLap;
            competitor.extraSegmentsPerLap[nextLap] = (competitor.extraSegmentsPerLap[nextLap] || 0) + misses;
            console.log(`${competitor.name}: +${misses} отрезков в круге ${nextLap}`);
        }
    }
    
    // Обновление позиций с учетом стрельбы
    updatePositions() {
        // Создаем временный массив для сортировки
        const tempCompetitors = [...this.allCompetitors];
        
        // Сортируем по общему игровому времени
        tempCompetitors.sort((a, b) => {
            // Сначала сравниваем по общему времени
            if (a.totalGameTime !== b.totalGameTime) {
                return a.totalGameTime - b.totalGameTime;
            }
            
            // Если время одинаковое, стреляющие участники идут после бегущих
            if (a.isShooting && !b.isShooting) return 1;
            if (!a.isShooting && b.isShooting) return -1;
            
            return 0;
        });
        
        // Обновляем позиции
        tempCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
        
        // Сохраняем обратно в allCompetitors
        this.allCompetitors = tempCompetitors;
    }
    
    // Получение текущего круга участника
    getCurrentLap(competitor) {
        return competitor.currentLap;
    }
    
    // Получение текущего сегмента в круге
    getCurrentSegmentInLap(competitor) {
        return competitor.completedSegmentsInCurrentLap;
    }
    
    // Проверка завершения гонки
    checkRaceCompletion() {
        const race = this.getCurrentRace();
        
        // Проверяем, завершили ли все участники гонку
        const allFinished = this.allCompetitors.every(competitor => 
            competitor.currentLap > race.totalLaps
        );
        
        if (allFinished) {
            this.finishRace();
            return;
        }
    }
    
    // Завершение гонки
    finishRace() {
        clearInterval(this.raceInterval);
        this.isRacing = false;
        this.raceFinished = true;
        
        // Для индивидуальной гонки добавляем штрафные минуты
        if (this.currentRaceType === 'individual') {
            this.allCompetitors.forEach(competitor => {
                competitor.totalGameTime += competitor.penaltyMinutes * 60;
            });
            this.updatePositions();
        }
        
        const playerPosition = this.player.position;
        let message = `Гонка завершена! Ваше место: ${playerPosition}`;
        
        if (playerPosition === 1) message += " 🥇 ПОБЕДА!";
        else if (playerPosition === 2) message += " 🥈";
        else if (playerPosition === 3) message += " 🥉";
        
        console.log(message);
        
        if (window.gameScreen) {
            window.gameScreen.showMessage(message, "success");
        }
        
        setTimeout(() => {
            if (window.mainMenu) {
                window.mainMenu.show();
            }
        }, 5000);
        
        return playerPosition;
    }
    
    // Активация спринта
    activateSprint() {
        if (this.player.stamina < 20) {
            return false;
        }
        
        this.player.speedMps += 1; // Увеличиваем скорость
        this.player.stamina -= 15;
        this.player.pulse = Math.min(180, this.player.pulse + 20);
        
        console.log("Спринт активирован!");
        
        // Спринт длится 6 секунд
        setTimeout(() => {
            this.player.speedMps = Math.max(2.78, this.player.speedMps - 1);
        }, 6000);
        
        return true;
    }
    
    // Активация медленного темпа
    activateSlowPace() {
        this.player.speedMps = Math.max(2.78, this.player.speedMps - 0.5);
        this.player.stamina = Math.min(this.player.maxStamina, this.player.stamina + 10);
        this.player.pulse = Math.max(100, this.player.pulse - 10);
        
        console.log("Темп снижен");
        return true;
    }
    
    // Получение отставания игрока
    getPlayerGap() {
        const leader = this.allCompetitors[0];
        return this.player.totalGameTime - leader.totalGameTime;
    }
    
    // Получение результатов стрельбы
    getShootingResults(competitor) {
        return {
            hits: competitor.shootingResults.filter(result => result).length,
            misses: competitor.shootingResults.filter(result => !result).length,
            shots: [...competitor.shootingResults],
            finished: !competitor.isShooting && competitor.shootingResults.length === 5
        };
    }
    
    // Проверка, идет ли стрельба
    isShootingInProgress() {
        return this.allCompetitors.some(competitor => competitor.isShooting);
    }
    
    // Возврат в меню
    returnToMenu() {
        if (this.isRacing) {
            clearInterval(this.raceInterval);
            this.isRacing = false;
        }
        this.isShooting = false;
        
        console.log("Возврат в главное меню");
        return true;
    }
    
    // Получение случайного ветра
    getRandomWind() {
        const windConditions = ["Слабый ветер", "Умеренный ветер", "Сильный ветер"];
        return windConditions[Math.floor(Math.random() * windConditions.length)];
    }
    
    // Методы для экранов этапов
    startShootingAfterStage() {
        const player = this.player;
        if (player && player.isShooting && player.currentShooting) {
            // Запускаем процесс стрельбы для игрока
            this.processShooting(player);
        }
    }
    
    continueAfterShooting() {
        const player = this.player;
        if (player) {
            // Обновляем позиции после стрельбы
            this.updatePositions();
        }
    }
}
