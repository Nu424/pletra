処理フローがごちゃついてる問題のリファクタリング案

actionの整理
　RecordContext
　TimerContext

　startAtとかで判定しているところ

handle~~の処理整理
　(特にTrackingPage)

----------
「セットされているTask」を用意する
　selectTask, deselectTask, selectedTaskで操作する
　startRecordのタイミングで
「記録中のRecord」を用意する
　これで、startAt等での判定が不要になる

----------
ばぶこの反省点

データ形式、基本的なフローは自分である程度用意したほうがいい
都度チェックを入れたほうが良い
　ひたすら「ステップxまでお願いします」すると追えなくなる

ぷるとら