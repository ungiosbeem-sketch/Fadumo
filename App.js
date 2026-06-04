import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  Vibration,
  SafeAreaView,
  StatusBar,
  Image,
} from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Constants
const PLAYER_SIZE = 50;
const COIN_SIZE = 35;
const MOVE_STEP = 25;
const PLAYER_Y = SCREEN_HEIGHT - PLAYER_SIZE - 50;
const MAX_PLAYER_X = SCREEN_WIDTH - PLAYER_SIZE;
const COIN_GEN_INTERVAL = 850;
const FALL_SPEED = 4.5;

export default function App() {
  const [playerX, setPlayerX] = useState(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2);
  const [coins, setCoins] = useState([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameActive, setGameActive] = useState(true);
  const requestRef = useRef();
  const intervalRef = useRef();

  const moveLeft = () => {
    if (!gameActive) return;
    setPlayerX(prev => Math.max(0, prev - MOVE_STEP));
  };

  const moveRight = () => {
    if (!gameActive) return;
    setPlayerX(prev => Math.min(MAX_PLAYER_X, prev + MOVE_STEP));
  };

  const generateCoin = () => {
    if (!gameActive) return;
    const randomX = Math.random() * (SCREEN_WIDTH - COIN_SIZE);
    const newCoin = {
      id: Date.now() + Math.random(),
      x: randomX,
      y: 0,
    };
    setCoins(prev => [...prev, newCoin]);
  };

  const updateGame = () => {
    if (!gameActive) return;

    setCoins(prevCoins => {
      const updated = prevCoins.map(coin => ({
        ...coin,
        y: coin.y + FALL_SPEED,
      }));

      let newScore = score;
      let newLives = lives;
      let remainingCoins = [];

      for (let coin of updated) {
        const playerRect = {
          x: playerX,
          y: PLAYER_Y,
          width: PLAYER_SIZE,
          height: PLAYER_SIZE,
        };
        const coinRect = {
          x: coin.x,
          y: coin.y,
          width: COIN_SIZE,
          height: COIN_SIZE,
        };
        if (
          playerRect.x < coinRect.x + coinRect.width &&
          playerRect.x + playerRect.width > coinRect.x &&
          playerRect.y < coinRect.y + coinRect.height &&
          playerRect.y + playerRect.height > coinRect.y
        ) {
          newScore += 1;
          Vibration.vibrate(50);
          continue;
        }

        if (coin.y + COIN_SIZE >= SCREEN_HEIGHT) {
          newLives -= 1;
          continue;
        }

        remainingCoins.push(coin);
      }

      if (newLives <= 0) {
        setGameActive(false);
        Alert.alert('Game Over', `Score: ${newScore}`, [{ text: 'Restart', onPress: restartGame }]);
      }
      setScore(newScore);
      setLives(Math.max(0, newLives));
      return remainingCoins;
    });
  };

  useEffect(() => {
    if (gameActive) {
      const animate = () => {
        updateGame();
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(requestRef.current);
  }, [gameActive, playerX, score, lives]);

  useEffect(() => {
    if (gameActive) {
      intervalRef.current = setInterval(generateCoin, COIN_GEN_INTERVAL);
    }
    return () => clearInterval(intervalRef.current);
  }, [gameActive]);

  const restartGame = () => {
    setPlayerX(SCREEN_WIDTH / 2 - PLAYER_SIZE / 2);
    setCoins([]);
    setScore(0);
    setLives(3);
    setGameActive(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1e3c32" />
      <View style={styles.stats}>
        <View style={styles.scoreBox}>
          <Text style={styles.statsLabel}>💰 SCORE</Text>
          <Text style={styles.statsValue}>{score}</Text>
        </View>
        <View style={styles.livesBox}>
          <Text style={styles.statsLabel}>❤️ LIVES</Text>
          <Text style={styles.statsValue}>{lives}</Text>
        </View>
      </View>

      <View style={styles.gameArea}>
        {coins.map(coin => (
          <View
            key={coin.id}
            style={[
              styles.coin,
              {
                left: coin.x,
                top: coin.y,
                width: COIN_SIZE,
                height: COIN_SIZE,
              },
            ]}
          />
        ))}
        <View
          style={[
            styles.player,
            {
              left: playerX,
              top: PLAYER_Y,
              width: PLAYER_SIZE,
              height: PLAYER_SIZE,
            },
          ]}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={moveLeft}>
          <Text style={styles.buttonText}>⬅️ LEFT</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={moveRight}>
          <Text style={styles.buttonText}>RIGHT ➡️</Text>
        </TouchableOpacity>
      </View>

      {!gameActive && (
        <TouchableOpacity style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.restartText}>🔄 RESTART</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3c32',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 20,
  },
  scoreBox: {
    backgroundColor: '#2c4a3e',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    width: '45%',
  },
  livesBox: {
    backgroundColor: '#2c4a3e',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    width: '45%',
  },
  statsLabel: {
    fontSize: 14,
    color: '#a8d5a2',
    fontWeight: '600',
  },
  statsValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffd966',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  player: {
    position: 'absolute',
    backgroundColor: '#f39c12',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  coin: {
    position: 'absolute',
    backgroundColor: '#f1c40f',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#e67e22',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#34495e',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 40,
    elevation: 5,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  restartButton: {
    alignSelf: 'center',
    backgroundColor: '#e67e22',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 30,
  },
  restartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
