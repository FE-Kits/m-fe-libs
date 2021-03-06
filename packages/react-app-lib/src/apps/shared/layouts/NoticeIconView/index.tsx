import { CurrentUser, NoticeItem } from '@m-fe/react-commons';
import { NoticeIcon } from '@m-fe/react-commons';
import { message, Tag } from 'antd';
import groupBy from 'lodash/groupBy';
import moment from 'moment';
import React, { Component } from 'react';

import { formatMessage } from '@/skeleton';

import { NoticeList } from '../NoticeList';
import styles from './index.less';

export interface NoticeIconViewProps {
  notices?: NoticeItem[];
  currentUser?: CurrentUser;
  fetchingNotices?: boolean;
  onNoticeVisibleChange?: (visible: boolean) => void;
  onNoticeClear?: (tabName?: string) => void;
}

export class NoticeIconView extends Component<NoticeIconViewProps> {
  static defaultProps: NoticeIconViewProps = {
    notices: [],
  };

  changeReadState = (clickedItem: NoticeItem): void => {
    const { id } = clickedItem;

    console.log('changeNoticeReadState: ' + id);
  };

  handleNoticeClear = (title: string, _: string) => {
    message.success(
      `${formatMessage({
        id: 'component.noticeIcon.cleared',
        defaultMessage: '清空完毕',
      })} ${title}`,
    );

    console.log('global/clearNotices');
  };

  getNoticeData = (): { [key: string]: NoticeItem[] } => {
    const { notices = [] } = this.props;
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map(notice => {
      const newNotice = { ...notice };
      if (newNotice.datetime) {
        newNotice.datetime = moment(notice.datetime as string).fromNow();
      }
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }
      if (newNotice.extra && newNotice.status) {
        const color = {
          todo: '',
          processing: 'blue',
          urgent: 'red',
          doing: 'gold',
        }[newNotice.status];
        newNotice.extra = (
          <Tag color={color} style={{ marginRight: 0 }}>
            {newNotice.extra}
          </Tag>
        );
      }
      return newNotice;
    });
    return groupBy(newNotices, 'type');
  };

  getUnreadData = (noticeData: { [key: string]: NoticeItem[] }) => {
    const unreadMsg: { [key: string]: number } = {};
    Object.keys(noticeData).forEach(key => {
      const value = noticeData[key];
      if (!unreadMsg[key]) {
        unreadMsg[key] = 0;
      }
      if (Array.isArray(value)) {
        unreadMsg[key] = value.filter(item => !item.read).length;
      }
    });
    return unreadMsg;
  };

  render() {
    const { currentUser, fetchingNotices, onNoticeVisibleChange } = this.props;
    const noticeData = this.getNoticeData();
    const unreadMsg = this.getUnreadData(noticeData);

    return (
      <NoticeIcon
        NoticeList={NoticeList}
        className={styles.action}
        count={currentUser && currentUser.unreadCount}
        loading={fetchingNotices}
        clearText={formatMessage({
          id: 'component.noticeIcon.clear',
          defaultMessage: '清空',
        })}
        viewMoreText={formatMessage({
          id: 'component.noticeIcon.view-more',
          defaultMessage: '更多',
        })}
        clearClose={true}
        onClear={this.handleNoticeClear}
        onPopupVisibleChange={onNoticeVisibleChange}
        onViewMore={() => message.info('Click on view more')}
        onItemClick={item => {
          this.changeReadState(item as NoticeItem);
        }}
      >
        <NoticeList
          tabKey="notification"
          count={unreadMsg.notification}
          list={noticeData.notification}
          title={formatMessage({
            id: 'component.globalHeader.notification',
            defaultMessage: '通知',
          })}
          emptyText={formatMessage({
            id: 'component.globalHeader.notification.empty',
            defaultMessage: '暂无通知',
          })}
          showViewMore={true}
        />
        <NoticeList
          tabKey="message"
          count={unreadMsg.message}
          list={noticeData.message}
          title={formatMessage({
            id: 'component.globalHeader.message',
            defaultMessage: '评论',
          })}
          emptyText={formatMessage({
            id: 'component.globalHeader.message.empty',
            defaultMessage: '暂无评论',
          })}
          showViewMore={true}
        />
        <NoticeList
          tabKey="event"
          title={formatMessage({
            id: 'component.globalHeader.event',
            defaultMessage: '事件',
          })}
          emptyText={formatMessage({
            id: 'component.globalHeader.event.empty',
            defaultMessage: '暂无事件',
          })}
          count={unreadMsg.event}
          list={noticeData.event}
          showViewMore={true}
        />
      </NoticeIcon>
    );
  }
}
