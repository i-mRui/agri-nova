import styles from "./page.module.css";
import Link from "next/link";

export default function Hero() {
    return (
        <div className={styles.container} id="Home">
            <div className={styles.heroContent}>
                <h1 className={styles.title}>Agrinova</h1>
                <p className={styles.description}>
                    Educational Farming Simulator with NASA Data
                </p>
                <Link href="/simulate">
                    <button className={styles.btn}>
                        Start Simulation
                    </button>
                </Link>
            </div>
        </div>
    )
}
