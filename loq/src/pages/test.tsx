import { motion } from "motion/react";
import Button from "../components/input/button";
import Layout from "../components/page/layout";
import { DualColumn } from "../components/display/format";

/*export default function Test() {
  return (
    <Layout hideHeader className="live host">
      <div className="host-game waiting">
        <div className="player-count section">
          <span className="number">109</span>
          <span>players</span>
        </div>
        <div className="room-code section">
          <div>
            Go to <span className="url">play.loq.to</span> and enter
          </div>
          <div className="number">12345</div>
        </div>
        <div className="loq-info section">
          <div className="title">I lovel oq</div>
          <div className="description">loq is cool</div>
          <div className="media">
            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
          </div>
        </div>
        <div className="start-button">
          <Button>Start!</Button>
        </div>
        <div className="players section">
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
          <button className="section">Joe</button>
          <button className="section">Joe 2</button>
        </div>
      </div>
    </Layout>
  );
}
*/

/*export default function Test() {
  return (
    <Layout hideHeader className="live host">
      <div className="host-game accent introduction">
        <DualColumn
          className="section question-number"
          left={"Question 1 of 100000"}
          right={"Multiple Choice"}
        />
        <div className="details section">
          <div className="title">I loq love JDFKJSHFKJSGHFKJHDSJFOIWEFIWESJFOWEISH E OWEUTIO EWTOI URWIOTU WROITU WOI TUOIWR TU</div>
          <div className="description">Loq love I</div>
          <div className="media">
            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwww.publicdomainpictures.net%2Fpictures%2F20000%2Fvelka%2Ftall-office-building-871299859831cWx.jpg&f=1&nofb=1&ipt=4e68c7a2281a4914e2dd59a5faf1411966be3099674fa0185d4d55613cb7787f" />
          </div>
        </div>
        <div className="progress section">
          <motion.div
            initial={{
              width: 0,
            }}
            animate={{
              width: "100%",
              transition: {
                ease: "linear",
                duration: 5,
              },
            }}
          />
        </div>
      </div>
      <div className="footer">
        <div>
          To join, go to <span className="url">play.loq.to</span> and enter <span className="number">12345</span>.
        </div>
      </div>
    </Layout>
  );
}
*/

export default function Test() {
  return (
    <Layout hideHeader className="live host">
      <div className="host-game waiting question">
        <div className="player-count">
          <div className="section">
            <span className="number">4</span>
            <span>seconds</span>
          </div>
          <div className="section">
            <span className="number">109</span>
            <span>answers</span>
          </div>
        </div>
        <div className="room-code section title">
          <div>
            Sample question
          </div>
        </div>
        <DualColumn
          className="section question-number"
          left={"Question 1 of 100000"}
          right={"Multiple Choice"}
        />
        <div className="loq-info section">
          <div className="description">Description</div>
          {/* <div className="media">
            <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
          </div> */}
        </div>
        <div className="start-button">
          <Button>Skip</Button>
        </div>
        <div className="answers">
          <div>
            <div
              className="section"
              style={{
                backgroundColor: "var(--answer-0)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/1.svg" />
              </div>
              <div className="answer-text">Answer 1</div>
              {/* <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div> */}
            </div>
          </div>
          <div>
            <div
              className="section incorrect"
              style={{
                backgroundColor: "var(--answer-1)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/2.svg" />
              </div>
              <div className="answer-text">Answer 2</div>
              {/* <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div> */}
            </div>
          </div>
          <div>
            <div
              className="section"
              style={{
                backgroundColor: "var(--answer-2)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/3.svg" />
              </div>
              <div className="answer-text">Answer 3</div>
              {/* <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div> */}
            </div>
          </div>
        </div>
      </div>
      <div className="footer accent">
        <div>
          To join, go to <span className="url">play.loq.to</span> and enter <span className="number">12345</span>.
        </div>
      </div>
    </Layout>
  );
}

/*export default function Test() {
  return (
    <Layout hideHeader className="live host">
      <div className="host-game waiting question results">
        <div className="room-code section title">
          <div>
            What is the leading cause of lead poisingin Tell me :( :( :( :( :(
            :( :( :( Amogus mmm m m m m m m mm
          </div>
        </div>
        <DualColumn
          className="section question-number"
          left={"Question 1 of 100000"}
          right={"Multiple Choice"}
        />
        {false ? (
          <div className="loq-info section">
            <div className="description">loq is cool</div>
            <div className="media">
              <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
            </div>
          </div>
        ) : (
          <div className="loq-info section user-answers">
            <div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="number">4</div>
              </div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="answer-text">4</div>
              </div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="answer-text">4</div>
              </div>
            </div>
            <div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="number">4</div>
              </div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="answer-text">4</div>
              </div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="answer-text">4</div>
              </div>
            </div>
            <div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="number">4</div>
              </div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="answer-text">4</div>
              </div>
              <div
                className="section"
                style={{
                  backgroundColor: "var(--answer-0)",
                }}
              >
                <div className="icon-container">
                  <img src="/icons/numbers/1.svg" />
                </div>
                <div className="answer-text">4</div>
              </div>
            </div>
          </div>
        )}

        <div className="start-button">
          <Button>Continue</Button>
          <Button>Show media</Button>
        </div>
        <div className="answers">
          <div>
            <div
              className="section"
              style={{
                backgroundColor: "var(--answer-0)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/1.svg" />
              </div>
              <div className="answer-text">Answer 1</div>
              <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div>
            </div>
            <div
              className="section"
              style={{
                backgroundColor: "var(--answer-0)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/1.svg" />
              </div>
              <div className="answer-text">Answer 1</div>
              <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div>
            </div>
            <div
              className="section"
              style={{
                backgroundColor: "var(--answer-0)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/1.svg" />
              </div>
              <div className="answer-text">Answer 1</div>
              <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div>
            </div>
          </div>
          <div>
            <div
              className="section incorrect"
              style={{
                backgroundColor: "var(--answer-1)",
              }}
            >
              <div className="icon-container">
                <img src="/icons/numbers/2.svg" />
              </div>
              <div className="answer-text">Answer 2</div>
              <div className="answer-image">
                <img src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F003%2F396%2F921%2Foriginal%2Fcute-potato-grandpa-is-getting-angry-free-vector.jpg&f=1&nofb=1&ipt=9b32f4bc93b7a51222450a5e72f804045c8c1876344e803c38d07fc2c71c8f9c" />
              </div>
            </div>
          </div>
          <div>
            <div
              className="section"
              style={{
                backgroundColor: "var(--answer-2)",
              }}
            >
              Answer 1
            </div>
          </div>
        </div>
      </div>
      <div className="footer accent">
        <div>
          To join, go to <span className="url">play.loq.to</span> and enter{" "}
          <span className="number">12345</span>.
        </div>
      </div>
    </Layout>
  );
}
*/

/*export default function Test() {
  return (
    <Layout hideHeader className="live host">
      <div className="host-game accent introduction leaderboard">
        <div className="details section">
          <div className="title">Leaderboard</div>
        </div>
        <div className="details leaderboard-content">
          <button className="section">
            <div>1</div>
            <div>Amogus234</div>
            <div>2345</div>
          </button>
          <button className="section">
            <div>1</div>
            <div>Amogus234</div>
            <div>2345</div>
          </button>
        </div>
      </div>
      <div className="footer">
        <div>
          To join, go to <span className="url">play.loq.to</span> and enter{" "}
          <span className="number">12345</span>.
        </div>
      </div>
    </Layout>
  );
}
*/