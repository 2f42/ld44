//current progress through the intro
var cur_step = 0;

//current hours left;
var hours = 300;

//money related stuff
var money = 0;
var hours_at_job = 0;
var job = "unemployed";
var raise = 0;
var wage = 0;

//modifiers
var wage_static = 0;
var wage_mult = 1;
var crime_static = 0;
var crime_mult = 1;
var busk_static = 0;
var busk_mult = 1;

//qualifications, [none, basic, maths, language, important skills, important skills 2]
var qualifications = [1, 0, 0, 0, 0, 0];
var criminal_record = 0;
var qualification_hint = 0;

//jobs, [wage, qualification, min hours existing, raise hours, raise amount, criminal record check]
var jobs = {
  "unemployed": [0, 0, 0, 600, 0, 0],
  "cleaner": [1, 0, 0, 600, 0, 0],
  "shop assistant": [1.5, 1, 0, 600, 0, 0],
  "manager": [3, 1, 96, 600, 0, 0],
  "accountant": [8, 2, 0, 48, 2, 1],
  "translator": [8, 3, 0, 48, 2, 1]
};

//items, [books, scandalous pictures of your boss, knife, deck, stale bread, hellshrooms]
var items = [0, 0, 0, 0, 0, 0]

//intro text
var intro_text = [
  "It looks like you are dead, but don&apos;t worry, because we have you covered",
  "We have a <b>once in a lifetime</b> opportunity, and all you have to do is make a deal to work with us",
  "We will give you a chance to earn <i>Soul Bucks&trade;</i>, which can eventually be exchanged for <i>Life Dollars&trade;</i>",
  "These <i>Life Dollars&trade;</i> can then be used to purchase a chance at reincarnation",
  "The only catch is that if you can&apos;t get enough funds to reincarnate, we get to keep your soul",
  "But this is the only offer like this you will ever get, and it&apos;s better than staying here forever",
  "So why not begin, and get out of the <i>Underworld&trade;</i>"
]

//wait for ms milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

//fades text between two things
async function fade_text(element, text) {
  element.classList.add("fades_out");
  element.classList.remove("fades_in");
  await sleep(900);
  element.innerHTML = text;
  element.classList.add("fades_in");
  element.classList.remove("fades_out");
}

//add to log
function pushlog(text) {
  document.getElementById("log").innerHTML = "<li class='log_item fades_in'>" + text + "</li>" + document.getElementById("log").innerHTML;
}

//make the game visible
async function set_up_game() {
  update();
  document.getElementById("titles").removeChild(title_text);
  document.getElementById("titles").removeChild(document.getElementById("continue_button"));
  document.getElementById("titles").removeChild(document.getElementById("skip_button"));
  document.getElementById("game").classList.add("fades_in");
  document.getElementById("game").classList.remove("invisible");
  pushlog("Welcome to the <i>Underworld&trade;</i>");
  await sleep(1000);
  pushlog("Why not start by finding a job?");
}

//handles the game ending and cleanup
async function game_over() {
  document.getElementById("game").classList.add("fades_out");
  await sleep(900);
  document.body.removeChild(document.getElementById("game"));
  document.getElementById("game_over_container").classList.add("fades_in");
  document.getElementById("game_over_container").classList.remove("invisible");
  document.getElementById("game_over_money").innerHTML = money;
  reincarnation_package = score_bracket();

  var big_text;
  switch (reincarnation_package) {
    case "angel":
      big_text = "Wow! You can buy our best package [$3000]. It even comes with immortality so you can escape the cycle of reincarnation! Enjoy your new life with the <i>Angel&trade;</i> package!";
      break;
    case "human":
      big_text = "This is enough to purchase our exclusive <i>Human&trade;</i> package! Sadly, you can&apos;t afford our most premium offering [$3000], but we will see you again soon!";
      break;
    case "monkey":
      big_text = "The best package you can afford is to reincarnate as a <i>Monkey&trade;</i>. However, when this life comes to an end, you can get a chance at being <i>Human&trade;</i> [$2500] again. Good luck!";
      break;
    case "dog":
      big_text = "Right now you can only afford to spend a lifetime as man&apos;s best friend, the <i>Dog&trade;</i>. However, you could upgrade to our next package [$2000] if you have more when you visit again! Sadly, you are a bit far off our <i>Human&trade;</i> [$2500] package, but better luck next time.";
      break;
    case "chicken":
      big_text = "Well, the best you can do right now is to reincarnate as a <i>Chicken&trade;</i>. At least its a quick life. Aim for our next tier [$1500] or for our <i>Human&trade;</i> [$2500] package with your next visit.";
      break;
    case "slug":
      big_text = "It&apos;s the <i>Slightly Better Than Losing Your Soul&trade;</i> tier! You will reincarnate as a <i>Slug&trade;</i>. Our next tier up is [$1000], but if you want to aim higher, go for our <i>Human&trade;</i> [$2500] package.";
      break;
    case "none":
      big_text = "Hmm... You can&apos;t afford any of our packages, not even our lowest [$500] tier! It looks like we&apos;ll be having that soul of yours. I would say better luck next time, but it looks like you&apos;re not reincarnating. Oh well!";
      break;
  }
  document.getElementById("final_text").innerHTML = big_text;
}

//calculates score bracket
function score_bracket() {
  if (money >= 3000) {
    return "angel";
  } else if (money >= 2500) {
    return "human";
  } else if (money >= 2000) {
    return "monkey";
  } else if (money >= 1500) {
    return "dog";
  } else if (money >= 1000) {
    return "chicken";
  } else if (money >= 500) {
    return "slug";
  } else {
    return "none";
  }
}

//updates the values and screen
function update() {
  wage_mult = 1 + 0.1 * items[0] + 0.25 * qualifications[4] + 0.25 * qualifications[5];
  wage_static = 2 * items[1] + jobs[job][4] * raise;
  wage = (jobs[job][0] + wage_static) * wage_mult;

  crime_mult = 1 + 0.5 * items[2];
  crime_static = 10 * items[0];

  busk_mult = 1 + 0.5 * items[3] + 0.5 * items[4];
  busk_static = 2 * items[0];

  money = Math.round(money * 100) / 100;

  fade_text(document.getElementById("moneybox"), "$" + money + " + $" + wage + " per hour of work");
  fade_text(document.getElementById("hoursbox"), hours + " hours left");

  if (hours <= 0) {
    game_over();
  }
}

//time skip function
function waitforever() {
  hours = 0;
  update();
}

//busk function
function busk() {
  if (hours - 4 >= 0) {
    var gains = Math.round(Math.random() * (500 + busk_static*100) * busk_mult) / 100 + busk_static;
    money += gains;
    hours -= 4;

    pushlog("After 4 hours on the street, showing off your talents, you gained $" + gains + ".");
  } else {
    pushlog("You don&apos;t have enough time left to busk. Sad!");
    document.getElementById("buskbutton").disabled = true;
  }

  update();
}

//crime function
function crime() {
  if (hours - 3 >= 0) {
    hours -= 3;
    var gains = Math.round(Math.random() * (2500 + crime_static*100) * crime_mult) / 100 + crime_static;

    var crime_success_chance = Math.random();
    var crime_caught_chance = Math.random();
    var crime_outcome;

    if (crime_success_chance < 0.6 * crime_mult) {
      crime_outcome = "success";
    } else if (crime_caught_chance < 0.6 * crime_mult) {
      crime_outcome = "failed";
    } else {
      crime_outcome = "caught";
    }

    switch (crime_outcome) {
      case "success":
        money += gains;
        pushlog("Those 3 hours of crime paid off. You got $" + gains + " from your illegal business. However, it might not be successful forever...");
        break;
      case "failed":
        pushlog("You wasted 3 hours trying to commit crimes, but you didn&apos;t actually manage to make any money. Jaywalking isnt the best way to make money.")
        break;
      case "caught":
        job = "unemployed";
        criminal_record = 1;
        hours_at_job = 0;
        raise = 0;
        pushlog("After 3 hours, you managed to mug the soul of an old woman. Sadly, you couldn&apos;t flee the crime scene fast enough. Now you are unemployed, have a criminal record, and missed out on the old woman&apos;s $" + gains + "! Sad! Better get back to job hunting.");
        break;
    }
  } else {
    pushlog("You don&apos;t have enough time left to commit crimes. Sad!");
    document.getElementById("crimebutton").disabled = true;
  }

  update();
}

//wander function
function wander() {
  if (hours - 2 >= 0) {
    hours -= 2;
    var item = Math.floor(Math.random() * 6);

    if (items[item] == 1) {
      pushlog("After 2 hours of wandering, you didn&apos;t find anything new (that was useful) this time.");
    } else {
      items[item] = 1;
      switch (item) {
        case 0:
          pushlog("After 2 hours of wandering, you found some books. They&apos;ll make you a bit more productive all around.");
          break;
        case 1:
          pushlog("After 2 hours of wandering, you saw an important person doing something questionable. Maybe using some images could help you earn more money at your next job...");
          break;
        case 2:
          pushlog("After 2 hours of wandering, you found a salty knife. Souls and demons don&apos;t like salt. This could help you <b>borrow</b> things from people.");
          break;
        case 3:
          pushlog("After 2 hours of wandering, you found a deck of playing cards. Maybe this could help you get more money from busking, if you show off your magic skills.");
          break;
        case 4:
          pushlog("2 hours. All for some stale bread. I dunno, maybe people will pity you more.");
          break;
        case 5:
          pushlog("After 2 hours of wandering, you picked some mushrooms. These could be fun.");
          break;
      }
    }
  } else {
    pushlog("You don&apos;t have enough time left to wander. Sad!");
    document.getElementById("wanderbutton").disabled = true;
  }

  update();
}

//school function
function school() {
  if (hours - 5 >= 0 && money - 25 >= 0) {
    money -= 25;
    hours -= 5;

    if (qualifications[1] == 0) {
      qualifications[1] = 1;
      pushlog("5 hours of schooling taught you the basics of demon maths and demon language, as well as the fact that dead people learn really quickly.");
    } else if (qualifications[2] == 0 || qualifications[3] == 0) {
      if (qualifications[2] == 0 && qualifications[3] == 1) {
        qualifications[2] = 1;
        pushlog("Maths is fun. Especially when you can learn a decent amount of it in 5 hours.");
      } else if (qualifications[2] == 1 && qualifications[3] == 0) {
        qualifications[3] = 1;
        pushlog("You have learned the intricacies of the demon language. And in 5 hours!");
      } else {
        if (Math.random() < 0.5) {
          qualifications[2] = 1;
          pushlog("Maths is fun. Especially when you can learn a decent amount of it in 5 hours.");
        } else {
          qualifications[3] = 1;
          pushlog("You have learned the intricacies of the demon language. And in 5 hours!");
        }
      }
    } else if (qualifications[4] == 0) {
      qualifications[4] = 1;
      pushlog("You just learned some generic important skills. These will make you more productive.");
    } else if (qualifications[5] == 0) {
      qualifications[5] = 1;
      pushlog("You just learned some more generic important skills. These will make you even more productive. Yes. I ran out of ideas.");
    } else {
      pushlog("You spent 5 hours and $25 to learn that there is nothing else for you to learn here.");
    }
  } else if (hours - 5 >= 0) {
    pushlog("Schooling in the underworld costs $25 for 5 hours of learning. Better get earning if you want to get educated.");
  } else {
    pushlog("You don&apos;t have enough time left to get educated. Why did you leave it so late? Sad!");
    document.getElementById("schoolbutton").disabled = true;
  }

  update();
}

//work function
function work() {
  if (hours - 8 >= 0) {
    money += wage * 8;
    hours -= 8;
    hours_at_job += 8;

    switch (job) {
      case "unemployed":
        pushlog("You spent 8 hours being unemployed. That was <i>very</i> productive.");
        break;
      case "cleaner":
        if (qualification_hint == 0) {
          pushlog("You spent 8 hours cleaning and got $" + wage*8 + " in return. If only you had some more qualifications...");
          qualification_hint = 1;
        } else {
          pushlog("You spent 8 hours cleaning and got $" + wage*8 + " in return.");
        }
        break;
      case "shop assistant":
        pushlog("You spent 8 hours at a cash register, and got $" + wage*8 + " in return.");
        break;
      case "manager":
        pushlog("You spent 8 hours in your office, watching the store. You got $" + wage*8 + " for this.");
        break;
      case "accountant":
        pushlog("You spent 8 hours looking at numbers. That netted you $" + wage*8 + ".");
        break;
      case "translator":
        pushlog("You spent 8 hours confused by the demon language. You got $" + wage*8 + " for the trouble.");
        break;
    }

    if (hours_at_job >= jobs[job][3] && raise == 0) {
      pushlog("After working here for " + hours_at_job + " hours, you have earned a raise with an extra $" + jobs[job][4] + "per hour. You're going up in the <i>Underworld&trade;</i>!");
      raise = 1;
    }
  } else {
    pushlog("You don&apos;t have enough time left to work. Sad!");
    document.getElementById("workbutton").disabled = true;
  }

  update();
}

//job search function
function job_search() {
  if (hours-1 >= 0) {
    hours -= 1;
    if (job == "accountant" || job == "translator") {
      pushlog("You wasted an hour searching for a job, before you realised that you will never get any better job due to your contract with <i>Underworld&trade;</i>. Sad.");
    } else {
      var jobs_qualified_for = [];
      for (const [key, value] of Object.entries(jobs)) {
        if (qualifications[value[1]] == 1 && value[2] <= hours && value[5] + criminal_record <= 1) {
          jobs_qualified_for.push(key);
        }
      }

      var job_text = "After searching for jobs for an hour, you found that you qualify for some nice jobs. You could become ";
      var job_choice = 0;
      var job_choice_name;

      for (var i=0; i<jobs_qualified_for.length; i++) {
        if (i == jobs_qualified_for.length-1) {
          job_text += " or ";
        }

        switch (jobs_qualified_for[i]) {
          case "unemployed":
            job_text += "unemployed";
            job_choice = Math.max(job_choice, 0);
            break;
          case "cleaner":
            job_text += "a cleaner";
            job_choice = Math.max(job_choice, 1);
            break;
          case "shop assistant":
            job_text += "a shop assistant";
            job_choice = Math.max(job_choice, 2);
            break;
          case "manager":
            job_text += "a store manager";
            job_choice = Math.max(job_choice, 3);
            break;
          case "accountant":
            job_text += "an accountant";
            job_choice = Math.max(job_choice, 4);
            break;
          case "translator":
            job_text += "a demon language translator";
            job_choice = Math.max(job_choice, 4);
            break;
        }

        if (i != jobs_qualified_for.length-1) {
          job_text += ", ";
        } else {
          job_text += ". ";
        }
      }

      switch (job_choice) {
        case 0:
          job_choice_name = "unemployed";
          break;
        case 1:
          job_choice_name = "cleaner";
          break;
        case 2:
          job_choice_name = "shop assistant";
          break;
        case 3:
          job_choice_name = "manager";
          break;
        case 4:
          var acc = jobs_qualified_for.includes("accountant");
          var tra = jobs_qualified_for.includes("translator");
          if (acc && tra) {
            if (Math.random() < 0.5) {
              job_choice_name = "accountant";
            } else {
              job_choice_name = "translator";
            }
          } else if (acc) {
            job_choice_name = "accountant";
          } else if (tra) {
            job_choice_name = "translator";
          }
          break;
      }

      if (job_choice_name == job) {
        job_text += "You decide that your current job is about as good as you'll get right now and that you wasted the last hour.";
      } else {
        job_text += "You decide to change jobs to become ";

        switch (job_choice_name) {
          case "unemployed":
            job_text += "unemployed";
            break;
          case "cleaner":
            job_text += "a cleaner";
            break;
          case "shop assistant":
            job_text += "a shop assistant";
            break;
          case "manager":
            job_text += "a store manager";
            break;
          case "accountant":
            job_text += "an accountant";
            break;
          case "translator":
            job_text += "a demon language translator";
            break;
        }

        job_text += ".";

        job = job_choice_name;
        hours_at_job = 0;
        raise = 0;
      }

      pushlog(job_text);
    }
  } else {
    pushlog("You don&apos;t have enough time left to search for a job. Sad!");
    document.getElementById("jobsearchbutton").disabled = true;
  }

  update();
}

//leisure function
function leisure() {
  if (hours-1 >= 0) {
    hours -= 1;

    if (items[6] == 0) {
      pushlog("That was a very productive hour you just spent there.");
    } else {
      var gains = Math.round(Math.random() * 1000) / 100;
      pushlog("After a hellshroom-fueled hour of hallucination, you find $" + gains + " in your hand. It doesn&apos;t matter where it came from, right?");
      money += gains;
    }
  } else {
    pushlog("You don&apos;t have enough time left to spend on leisure. Sad!");
    document.getElementById("leisurebutton").disabled = true;
  }

  update();
}

//handles the intro
async function next_step() {
  var title_text = document.getElementById("title_text");

  switch (cur_step) {
    case 0:
      fade_text(title_text, intro_text[0]);
      cur_step++;
      break;
    case 1:
      fade_text(title_text, intro_text[1]);
      cur_step++;
      break;
    case 2:
      fade_text(title_text, intro_text[2]);
      cur_step++;
      break;
    case 3:
      fade_text(title_text, intro_text[3]);
      cur_step++;
      break;
    case 4:
      fade_text(title_text, intro_text[4]);
      cur_step++;
      break;
    case 5:
      fade_text(title_text, intro_text[5]);
      cur_step++;
      break;
    case 6:
      fade_text(title_text, intro_text[6]);
      cur_step++;
      break;
    case 7:
      set_up_game();
      break;
    default:
      document.write("something went horribly wrong, refresh the page.");
      break;
  }
}
