import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import login from "./components/pages/login";
import sign from "./components/pages/signup";
import profile from "./components/pages/profile";
import home from "./components/pages/home";
import hp from "./components/pages/howtoplay";
import rules from "./components/pages/rules";
import levels from "./components/pages/levels";
import l1 from "./components/pages/level1";
import l2 from "./components/pages/level2";
import l3 from "./components/pages/level3";
import l4 from "./components/pages/level4";
import l5 from "./components/pages/level5";
import l6 from "./components/pages/level6";
import l7 from "./components/pages/level7";
import l8 from "./components/pages/level8";
import l9 from "./components/pages/level9";
import l10 from "./components/pages/level10";

const App = () => {
  return (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={sign} />
          <Route path="/login" component={login} />
          <Route path="/profile" component={profile} />
          <Route path="/home" component={home} />
          <Route path="/hp" component={hp} />
          <Route path="/rules" component={rules} />
          <Route path="/levels" component={levels} />
          <Route path="/l1" component={l1} />
          <Route path="/l2" component={l2} />
          <Route path="/l3" component={l3} />
          <Route path="/l4" component={l4} />
          <Route path="/l5" component={l5} />
          <Route path="/l6" component={l6} />
          <Route path="/l7" component={l7} />
          <Route path="/l8" component={l8} />
          <Route path="/l9" component={l9} />
          <Route path="/l10" component={l10} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;
