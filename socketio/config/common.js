// common.js

var env = (process.env.NODE_ENV) ? process.env.NODE_ENV : 'development';

var databases = require('./' + env + '/database.js');

module.exports = {
  graceful_time: 60, // 定期gracefulの時間(分)

  connection_key_str: 'connection', // 接続数の情報
  max_connection_key_str: 'max_connection', // 接続数の情報
  myuuid_key_str: 'my_uuid', // uuidの情報
  myinfo_key_str: 'my_info', // ユーザの能力や戦績などの情報
  myfriend_key_str: 'my_friend', // ユーザのフレンド情報
  mycode_key_str: 'my_code', // userIdに対するコードの保持情報（受付ユーザ用）
  mymatching_key_str: 'my_matching', // userIdに対する現在の進行状況
  //battleinfo_key_str: 'battle_info', // バトルのルールの情報
  roominfo_key_str: 'room_info', // 部屋のルールの情報
  room_code_key_str: 'room_code', // 部屋コードの現在の状態
  lockedroom_code_key_str: 'locked_room', // 合言葉を設定している部屋
  freeroom_code_key_str: 'free_room', // 合言葉を設定していない部屋
  room_member_key_str: 'room_member', //部屋のメンバー
  battleTag_seq_key: 'battle_tag_seaquence', //バトルタグ
  battle_table_key_str: 'battle_table', // バトルの状態
  battle_reopen_key_str: 'battle_reopen', // バトルの再開
    
  battleid_seq_key: 'battleId_seq', // battleIdのシーケンス
  battlecode_seq_key: 'battleCode_seq', // battleCodeのシーケンス

  multi_is_suspend_key_str: 'multi_is_suspend', // バトルの状態
  multi_suspend_num_key_str: 'multi_suspend_num', // バトルの再開
    
  maxSearchRoomListNum:10,		//MAX候補人数
  
  room_suspend_wait_time_key_str: 'multi_supend_time_room', //デフォルトから設定を変える場合
  battle_suspend_wait_time_key_str: 'multi_supend_time_battle', //デフォルトから設定を変える場合
    
  roomSuspendWaitTime: 60, //
  battleSuspendWaitTime: 30, //バトル中サスペンドを許容する時間 30s
  roomCodeExpireTime:  60 * 60 * 1,  // 部屋コードを保持する期間 1h
  suspendNumExpireTime:  60 * 60 * 2,  // サスペンド回数を保持する期間 2h
  battleInfoExpireTime:  60 * 60 * 24,  // バトル情報を保持する期間 24h
  isSuspendExpireTime:  60 * 2,  // サスペンド状態を保持する期間 2m
  suspendConnectKillNum: 10, //１度のバトルに許容するサスペンド回数
  maxConnection: 10000, //最大接続数
  listenport: 8100,
  paramRange: 300,
  databases: databases
}