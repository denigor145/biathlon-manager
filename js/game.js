class BiathlonGame {
    constructor() {
        // Типы гонок
        this.raceTypes = {
            sprint: {
                name: "Спринт",
                totalSegments: 60,
                shootingRounds: [
                    { afterSegment: 20, position: "prone", name: "Стрельба лёжа" },
                    { afterSegment: 40, position: "standing", name: "Стрельба стоя" }
                ]
            }
        };

        // Текущее состояние игры
        this.currentRaceType = "sprint";
        this.currentSegment = 1;
        this.totalTime = 0;
        this.isRacing = false;
        this.isShooting = false;
        this.currentShootingRound = null;
        this.raceInterval = null;
        
        // Игрок
        this.player = {
            name: "Вы",
            flag: "🎯",
            speed: 5,
            stamina: 100,
            maxStamina: 100,
            pulse: 120,
            position: 4,
            time: 18.3,
            isPlayer: true,
            shooting: {
                prone: 0.8,  // Точность лёжа 80%
                standing: 0.6 // Точность стоя 60%
            }
        };
        
        this.opponents = this.generateOpponents(10);
        this.allCompetitors = [this.player, ...this.opponents];
        
        console.log("Биатлон Менеджер инициализирован!");
    }
    
    generateOpponents(count) {
        const names = ["Йоханссон", "Мюллер", "Мартен", "Ларссон", "Хубер", "Бё", "Фуркад"];
        const flags = ["🇳🇴", "🇩🇪", "🇫🇷", "🇸🇪", "🇦🇹", "🇫🇮", "🇮🇹"];
        
        return Array.from({length: count}, (_, i) => ({
            name: names[i % names.length],
            flag: flags[i % flags.length],
            speed: 4 + Math.random() * 3,
            stamina: 80 + Math.random() * 20,
            pulse: 110 + Math.random() * 30,
            position: i + 1,
            time: i * 2.5,
            isPlayer: false,
            shooting: {
                prone: 0.7 + Math.random() * 0.2,
                standing: 0.5 + Math.random() * 0.2
            }
        }));
    }
    
    startRace() {
        if (this.isRacing) return;
        
        this.isRacing = true;
        this.raceInterval = setInterval(() => {
            this.updateRace();
        }, 2000); // Обновление каждые 2 секунды (1 сегмент)
        
        console.log("Гонка началась!");
    }
    
    updateRace() {
        const race = this.raceTypes[this.currentRaceType];
        
        // Проверяем, нужно ли переходить к стрельбе
        const shootingRound = race.shootingRounds.find(round => 
            round.afterSegment === this.currentSegment
        );
        
        if (shootingRound && !this.isShooting) {
            this.startShooting(shootingRound);
            return;
        }
        
        if (this.currentSegment > race.totalSegments) {
            this.finishRace();
            return;
        }
        
        // Обновляем позиции всех участников
        this.updateCompetitors();
        
        this.currentSegment++;
        this.totalTime += 2; // 2 секунды на сегмент
        
        console.log(`Сегмент: ${this.currentSegment}/${race.totalSegments}`);
    }
    
    startShooting(shootingRound) {
        this.isShooting = true;
        this.currentShootingRound = shootingRound;
        
        console.log(`Началась ${shootingRound.name}`);
        alert(`🎯 ${shootingRound.name}!`);
        
        // Симуляция стрельбы (3 секунды)
        setTimeout(() => {
            this.finishShooting();
        }, 3000);
    }
    
    finishShooting() {
        this.isShooting = false;
        this.currentShootingRound = null;
        
        // Продолжаем гонку
        this.currentSegment++;
        console.log("Стрельба завершена, продолжаем гонку");
    }
    
    updateCompetitors() {
        // Обновляем позиции всех участников
        this.allCompetitors.forEach(competitor => {
            if (!competitor.isPlayer) {
                // AI логика для соперников
                const timeChange = (Math.random() * 0.4 - 0.2); // -0.2 до +0.2
                competitor.time = Math.max(0, competitor.time + timeChange);
            }
        });
        
        // Сортируем по времени
        this.allCompetitors.sort((a, b) => a.time - b.time);
        
        // Обновляем позиции
        this.allCompetitors.forEach((competitor, index) => {
            competitor.position = index + 1;
        });
    }
    
    activateSprint() {
        if (this.player.stamina < 20) {
            alert("Недостаточно выносливости для спринта!");
            return;
        }
        
        this.player.speed += 2;
        this.player.stamina -= 15;
        this.player.pulse = Math.min(180, this.player.pulse + 20);
        
        console.log("Спринт активирован!");
        
        // Возврат к нормальной скорости через 3 сегмента
        setTimeout(() => {
            this.player.speed = Math.max(5, this.player.speed - 2);
        }, 6000);
    }
    
    activateSlowPace() {
        this.player.speed = Math.max(3, this.player.speed - 1);
        this.player.stamina = Math.min(100, this.player.stamina + 10);
        this.player.pulse = Math.max(100, this.player.pulse - 10);
        
        console.log("Темп снижен");
    }
    
    getCurrentRace() {
        return this.raceTypes[this.currentRaceType];
    }
}
