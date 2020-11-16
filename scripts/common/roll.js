export async function commonRoll(rollData) {
  _rollPoolDice(rollData);
  _computeDice(rollData);
  rollData.result.dice.push(_computeWrath(rollData.result.wrath));
  _computeChat(rollData);
  await _sendToChat(rollData);
}

export async function weaponRoll(rollData) {
  let weaponName = rollData.name;
  rollData.name = game.i18n.localize(rollData.skillName);
  await commonRoll(rollData);
  rollData.name = weaponName;
  if (rollData.result.isSuccess) {
    _rollDamage(rollData);
    await _sendDamageToChat(rollData);
  }
}

export async function damageRoll(rollData) {
  _rollDamage(rollData);
  await _sendDamageToChat(rollData);
}

export async function reroll(rollData) {
  rollData.result.dice = rollData.result.dice.map(die => {
    if (die.rerollable) {
      let d = new Die({ faces: 6, number: 1 }).evaluate();
      console.log(die);
      if (die.isWrath) {
        return _computeWrath(d.total);
      } else {
        return _computeDice(d.total);
      }
    } else {
      return die;
    }
  });
  _computeChat(rollData);
  await _sendToChat(rollData);
}

function _rollPoolDice(rollData) {
  let size = rollData.pool.size + rollData.pool.bonus;
  rollData.dn = rollData.difficulty.target + rollData.difficulty.penalty;
  let formula = `${size}d6`;
  let r = new Roll(formula, {});
  r.evaluate();
  r.terms.forEach((term) => {
    if (typeof term === 'object' && term !== null) {
      term.results.forEach(result => {
        if (rollData.result.wrath === 0) {
          rollData.result.wrath = result.result;
        } else {
          let die = _computeDice(result.result);
          rollData.result.dice.push(die);
        }
      });
    }
  });
}

function _rollDamage(rollData) {
  let formula = `${rollData.weapon.ed}d6`;
  let r = new Roll(formula, {});
  r.evaluate();
  rollData.result.damage = {
    dice: [],
    total: rollData.weapon.damage + rollData.weapon.bonus
  };
  r.terms.forEach((term) => {
    if (typeof term === 'object' && term !== null) {
      term.results.forEach(result => {
        let die = _computeDice(result.result);
        rollData.result.damage.total = rollData.result.damage.total + die.value;
        rollData.result.damage.dice.push(die);
      });
    }
  });
  rollData.result.damage.dice.sort((a, b) => { return b.weight - a.weight });
}

function _computeChat(rollData) {
  rollData.result.dice.sort((a, b) => { return b.weight - a.weight });
  rollData.result.success = _countSuccess(rollData);
  rollData.result.failure = _countFailure(rollData);
  rollData.result.shifting = _countShifting(rollData);
  rollData.result.isSuccess = rollData.result.success >= rollData.dn;
  rollData.result.isWrathCritical = rollData.result.wrath === 6;
  rollData.result.isWrathComplication = rollData.result.wrath === 1;
}

function _computeDice(dieValue) {
  if (dieValue === 6) {
    return {
      name: "icon",
      value: 2,
      isWrath: false,
      rerollable: false,
      weight: 3
    };
  } else if (dieValue > 3) {
    return {
      name: "success",
      value: 1,
      isWrath: false,
      rerollable: false,
      weight: 2
    };
  } else {
    return {
      name: "failed",
      value: 0,
      isWrath: false,
      rerollable: true,
      weight: 1
    };
  }
}

function _computeWrath(dieValue) {
  if (dieValue === 6) {
    return {
      name: "wrath-critical",
      value: 2,
      isWrath: true,
      rerollable: false,
      weight: 0
    };
  } else if (dieValue > 3) {
    return {
      name: "wrath-success",
      value: 1,
      isWrath: true,
      rerollable: false,
      weight: 0
    };
  } else if (dieValue === 1) {
    return {
      name: "wrath-complication",
      value: 0,
      isWrath: true,
      rerollable: false,
      weight: 0
    };
  } else {
    return {
      name: "wrath-failed",
      value: 0,
      isWrath: true,
      rerollable: true,
      weight: 0
    };
  }
}

function _countSuccess(rollData) {
  let success = 0;
  for (let i = 0; i < rollData.result.dice.length; i++) {
    success += rollData.result.dice[i].value;
  }
  return success;
}

function _countFailure(rollData) {
  let failure = 0;
  for (let i = 0; i < rollData.result.dice.length; i++) {
    if (rollData.result.dice[i].value === 0) {
      failure++;
    }
  }
  return failure;
}

function _countShifting(rollData) {
  let shifting = 0;
  let margin = rollData.result.success - rollData.dn;
  for (let i = 0; i < rollData.result.dice.length; i++) {
    if (rollData.result.dice[i].value === 2 && margin - 2 >= 0) {
      shifting++;
      margin = margin - 2;
    }
  }
  return shifting;
}

async function _sendToChat(rollData) {
  const html = await renderTemplate("systems/wrath-and-glory/template/chat/roll.html", rollData);
  let chatData = {
    user: game.user._id,
    rollMode: game.settings.get("core", "rollMode"),
    content: html,
  };
  if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  } else if (chatData.rollMode === "selfroll") {
    chatData.whisper = [game.user];
  }
  ChatMessage.create(chatData);
}

async function _sendDamageToChat(rollData) {
  const html = await renderTemplate("systems/wrath-and-glory/template/chat/damage.html", rollData);
  let chatData = {
    user: game.user._id,
    rollMode: game.settings.get("core", "rollMode"),
    content: html,
  };
  if (["gmroll", "blindroll"].includes(chatData.rollMode)) {
    chatData.whisper = ChatMessage.getWhisperRecipients("GM");
  } else if (chatData.rollMode === "selfroll") {
    chatData.whisper = [game.user];
  }
  ChatMessage.create(chatData);
}