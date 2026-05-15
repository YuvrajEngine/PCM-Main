import * as React from "react";
import "./Pages/CSS/Pcm.scss";
import type { IPcmProps } from "./IPcmProps";
import styles from "./Pcm.module.scss";
import { HashRouter } from "react-router-dom";
import { ParallaxProvider } from "react-scroll-parallax";
import {
  HashRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom";
import Bjfcl from "./Pages/BJFCL";
import SafetyViolationDetails from "./Pages/SafetyViolationRequest";
import SeverityViolationReport from "./Pages/SeverityViolationReport";
import SafetyViolationRequestEdit from "./Pages/SafetyViolationRequestEdit";
import SafetyViolationPdf from "./Pages/SafetyViolationPdf";

/* ================= HOME PAGE ================= */
const Home: React.FC<IPcmProps> = (props: IPcmProps) => {
  const history = useHistory();
  return (
    <section className="pcm">
      <div className="pcm-container">
        {/* LEFT SIDE */}
        <div className="pcm-left">
          <h1 className="pcm-title">Progressive Consequence Management</h1>
          <div className="pcm-grid">
            <div className="pcm-tile">Nagda</div>
            <div className="pcm-tile">BC Kharach</div>
            <div className="pcm-tile">Harihar</div>
            <div className="pcm-tile">Vilayat</div>
            <div className="pcm-tile">TRC</div>
            <div className="pcm-tile">IBR</div>
            {/* ROUTING TILE */}
           <div
  className="pcm-tile"
  onClick={() => {
    const currentUrl = window.location.href.split("#")[0]; 
    window.open(`${currentUrl}#/bjfcl`, "_blank", "noopener,noreferrer");
  }}
  style={{ cursor: "pointer" }}
>
  BJFCL
</div>
            <div className="pcm-tile">BC Excel</div>
          </div>
        </div>
        {/* RIGHT SIDE IMAGE */}
        <div className="pcm-right"></div>
      </div>
    </section>
  );
};

/* ================= MAIN COMPONENT ================= */
// export const Pcm: React.FC<IPcmProps>  = (props: IPcmProps) => {
//     return (
//       <Router>
//         <Switch>
//           {/* HOME */}
//           <Route exact path="/" component={Home} {...props}/>
//           {/* BJFCL */}
//           <Route exact path="/bjfcl" component={Bjfcl} {...props}/>
//           {/* ADD PAGE */}
//           <Route path="/bjfcl/add" component={SafetyViolationDetails} {...props}/>
//         </Switch>
//       </Router>
//     );
// }
export default class Pcm extends React.Component<IPcmProps> {
  public render(): React.ReactElement<IPcmProps> {
    const {
      description,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName,
    } = this.props;

    return (
      <section
        className={`${styles.pcm} ${hasTeamsContext ? styles.teams : ""}`}
      >
        <ParallaxProvider>
          <HashRouter>
            <div style={{ display: "flex", height: "100vh" }}>
              {/* Main Content */}
              <div style={{ flex: 1, overflow: "auto" }}>
                <Switch>
                  <Route
                    exact
                    path="/"
                    render={() => <Home {...this.props} />}
                  />
                  <Route
                    path="/bjfcl"
                    render={() => <Bjfcl {...this.props} />}
                  />
                  <Route
                    path="/SafetyViolationDetails"
                    render={() => <SafetyViolationDetails {...this.props} />}
                  />
                  <Route path="/SeverityViolationReport" render={() => <SeverityViolationReport {...this.props} />}/>
                  <Route path="/SafetyViolationRequestEdit" render={() => (<SafetyViolationRequestEdit {...this.props} />)}/>
                  <Route path="/SeverityViolationReport" render={() => (<SeverityViolationReport {...this.props} />)}/>
                  <Route path="/SafetyViolationPdf" render={() => (<SafetyViolationPdf {...this.props} />)}/>
                </Switch>
              </div>
            </div>
          </HashRouter>
        </ParallaxProvider>
      </section>
    );
  }
}
