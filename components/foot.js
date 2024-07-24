import Link from 'next/link';
import styles from './foot.module.css';
import { Row, Col, Image } from 'antd';

export default function Foot() {
  return (
    <div className={styles.bg}>
      <div style={{ width: '80%', margin: '0 auto' }}>
        <Row gutter={[0, 0]}>
          <Col span={8}>
            <div className={styles.about}>Mechain faucet</div>
            <div className={styles.chain}>Copyright © 2024 Mechain</div>
            <div className={styles.chain}>All rights reserved</div>
          </Col>
          <Col span={8}>
            <div className={styles.about}>About us</div>
            <div className={styles.chain}>Knowledge Base</div>
            {/* <div className={styles.chain}>About us</div> */}
            <div className={styles.chain}>Terms of Service</div>
          </Col>
          <Col span={8}>
            <div className={styles.about}>Social Media</div>
            <div className={styles.pic} style={{ padding: '15px 0px 0px 8px', float: 'left' }}>
              <Image width={28} height={18} src="/images/email.png" preview={false} />
            </div>
            <div className={styles.pic} style={{ padding: '12px 0px 0px 10px', float: 'left', marginLeft: '10px' }}>
              <Image width={24} height={22} src="/images/robot.png" preview={false} />
            </div>
            <div className={styles.pic} style={{ padding: '15px 0px 0px 10px', float: 'left', marginLeft: '10px' }}>
              <Image width={23} height={19} src="/images/twitter.png" preview={false} />
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}
