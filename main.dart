import 'dart:html';

class Player {
  int score;
  List<int> history;
  Element scoreDisplay;
  Element historyDisplay;
  Element currentThrowDisplay;
  int? selectedNumber;
  int currentMultiplier = 1;

  Player(this.scoreDisplay, this.historyDisplay, this.currentThrowDisplay) {
    score = 501;
    history = [];
    updateDisplay();
  }

  void setNumber(int number) {
    selectedNumber = number;
    updateCurrentThrowDisplay();
  }

  void setMultiplier(int multiplier) {
    currentMultiplier = multiplier;
    updateCurrentThrowDisplay();
  }

  void updateCurrentThrowDisplay() {
    if (selectedNumber == null) {
      currentThrowDisplay.text = '';
      return;
    }
    
    String multiplierText = '';
    switch (currentMultiplier) {
      case 1:
        multiplierText = 'Single';
        break;
      case 2:
        multiplierText = 'Double';
        break;
      case 3:
        multiplierText = 'Triple';
        break;
    }
    
    currentThrowDisplay.text = '$multiplierText $selectedNumber (${selectedNumber! * currentMultiplier} points)';
  }

  void confirmThrow() {
    if (selectedNumber == null) {
      window.alert('Please select a number first!');
      return;
    }

    int points = selectedNumber! * currentMultiplier;
    
    if (score - points < 0) {
      window.alert('Invalid score! Cannot go below 0.');
      return;
    }

    score -= points;
    history.add(points);
    selectedNumber = null;
    currentMultiplier = 1;
    updateDisplay();
    updateCurrentThrowDisplay();
  }

  void undoLast() {
    if (history.isEmpty) {
      window.alert('No moves to undo!');
      return;
    }

    score += history.removeLast();
    updateDisplay();
  }

  void updateDisplay() {
    scoreDisplay.text = score.toString();
    historyDisplay.text = history.join(' → ');
  }
}

void createNumberButtons(Element grid, Function(int) onNumberClick) {
  // Clear any existing buttons
  grid.children.clear();
  
  // Create buttons for numbers 0-20
  for (int i = 0; i <= 20; i++) {
    final button = ButtonElement()
      ..text = i.toString()
      ..onClick.listen((_) => onNumberClick(i));
    grid.children.add(button);
  }
}

void main() {
  // Initialize players
  final player1 = Player(
    querySelector('#score1')!,
    querySelector('#history1')!,
    querySelector('#currentThrow1')!,
  );

  final player2 = Player(
    querySelector('#score2')!,
    querySelector('#history2')!,
    querySelector('#currentThrow2')!,
  );

  // Create number buttons for both players
  createNumberButtons(
    querySelector('#numberGrid1')!,
    (number) => player1.setNumber(number),
  );

  createNumberButtons(
    querySelector('#numberGrid2')!,
    (number) => player2.setNumber(number),
  );

  // Add global functions for HTML onclick handlers
  window['setMultiplier'] = (int playerNum, int multiplier) {
    final player = playerNum == 1 ? player1 : player2;
    player.setMultiplier(multiplier);
  };

  window['confirmThrow'] = (int playerNum) {
    final player = playerNum == 1 ? player1 : player2;
    player.confirmThrow();
  };

  window['undoLast'] = (int playerNum) {
    final player = playerNum == 1 ? player1 : player2;
    player.undoLast();
  };
} 