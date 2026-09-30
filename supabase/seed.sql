-- =============================================================================
-- 아기별 지도 — 개발/초기 실행용 SEED 데이터
--
-- ⚠️ 중요
--   * 이 파일의 모든 콘텐츠는 화면 동작 확인을 위한 "샘플 데이터"이다 (is_sample = true).
--   * 전문가 검토를 거치지 않았으며 reviewed_at 은 비어 있다.
--   * 예방접종(vaccines) 데이터는 질병관리청 표준예방접종일정표의 일반적인 구성을 참고한
--     예시로, data_reference_date 가 비어 있다. 서비스 공개 전 반드시
--     질병관리청 예방접종도우미(https://nip.kdca.go.kr)의 최신 일정표로 검증하고
--     관리자 페이지에서 기준일/검토일을 입력한 뒤 is_sample 을 해제해야 한다.
--
-- 여러 번 실행해도 안전하도록 slug 기준 upsert 를 사용한다.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 출처
-- -----------------------------------------------------------------------------
insert into public.content_sources (id, organization, title, url, published_at, reviewed_at) values
  ('00000000-0000-4000-8000-000000000001', '질병관리청', '예방접종도우미 · 표준예방접종일정표', 'https://nip.kdca.go.kr', null, null),
  ('00000000-0000-4000-8000-000000000002', 'CDC', 'Learn the Signs. Act Early. — Developmental Milestones', 'https://www.cdc.gov/act-early/', null, null),
  ('00000000-0000-4000-8000-000000000003', 'WHO', 'Complementary feeding', 'https://www.who.int/health-topics/complementary-feeding', null, null),
  ('00000000-0000-4000-8000-000000000004', 'American Academy of Pediatrics', 'HealthyChildren.org', 'https://www.healthychildren.org', null, null),
  ('00000000-0000-4000-8000-000000000005', '아기별 지도 편집팀', '샘플 콘텐츠 (전문가 검토 전)', null, null, null),
  ('00000000-0000-4000-8000-000000000006', 'WHO', 'Child growth standards', 'https://www.who.int/tools/child-growth-standards', null, null)
on conflict (id) do update set
  organization = excluded.organization, title = excluded.title, url = excluded.url;

-- -----------------------------------------------------------------------------
-- 발달 항목 (관찰 월령 범위, 개인차 큼)
-- -----------------------------------------------------------------------------
insert into public.development_items (slug, domain, min_month, max_month, title, description, parent_activities, sort_order, is_sample) values
  ('eye-contact', 'social_emotional', 0, 2, '눈을 맞추고 얼굴을 바라봐요', '가까이 있는 사람의 얼굴을 바라보는 모습이 이 시기에 관찰될 수 있어요. 아기마다 시기와 방식에는 차이가 있어요.', array['20~30cm 거리에서 얼굴을 보여주며 천천히 말을 걸어주세요.', '수유할 때 눈을 바라보며 이야기해 주세요.'], 10, true),
  ('follow-object', 'cognitive', 1, 3, '움직이는 물건을 눈으로 따라가요', '천천히 움직이는 물건이나 얼굴을 눈으로 좇는 모습이 관찰될 수 있어요.', array['흑백 대비가 뚜렷한 그림을 천천히 좌우로 움직여 보여주세요.'], 20, true),
  ('social-smile', 'social_emotional', 1, 3, '사람을 보고 웃어요', '부모의 얼굴이나 목소리에 반응해 웃는 "사회적 미소"가 나타날 수 있어요.', array['아기가 웃으면 같이 웃어주고 말로 반응해 주세요.'], 30, true),
  ('lift-head-tummy', 'gross_motor', 1, 3, '엎드린 자세에서 잠깐 고개를 들어요', '깨어 있을 때 엎드린 자세(터미타임)에서 고개를 잠깐 들어 올리는 모습이 보일 수 있어요.', array['깨어 있을 때, 어른이 지켜보는 가운데 짧게 터미타임을 해 보세요.', '아기 눈높이에 얼굴이나 장난감을 두어 고개를 들 동기를 주세요.'], 40, true),
  ('cooing', 'language', 1, 4, '"아", "우" 같은 소리를 내요', '목 울림소리(쿠잉)나 짧은 모음 소리를 내기 시작할 수 있어요.', array['아기가 소리를 내면 잠시 기다렸다가 따라 해 주세요. 대화를 주고받는 경험이 돼요.'], 50, true),
  ('hands-to-mouth', 'fine_motor', 2, 4, '손을 입으로 가져가요', '자기 손을 바라보거나 입으로 가져가 탐색하는 모습이 관찰될 수 있어요.', array['손이 자유롭게 움직일 수 있도록 편안한 옷을 입혀 주세요.'], 60, true),
  ('head-control', 'gross_motor', 3, 5, '목을 점점 안정적으로 가눠요', '안거나 세워 앉혔을 때 머리를 흔들림 없이 유지하는 시간이 길어질 수 있어요.', array['터미타임 시간을 아기 컨디션에 맞춰 조금씩 늘려 보세요.'], 70, true),
  ('grasp-toy', 'fine_motor', 3, 6, '장난감을 잡고 흔들어요', '손에 쥐여준 장난감을 잡고 흔들거나 입으로 가져갈 수 있어요.', array['가볍고 잡기 쉬운 딸랑이를 손 가까이에 두어 보세요.'], 80, true),
  ('laughing', 'social_emotional', 3, 5, '소리 내어 웃어요', '간지럼이나 놀이에 소리 내어 웃는 모습이 보일 수 있어요.', array['표정을 크게 바꾸며 놀아주세요.'], 90, true),
  ('babble-response', 'language', 4, 6, '말을 걸면 소리로 반응해요', '말을 걸면 대답하듯 소리를 내는 모습이 관찰될 수 있어요.', array['일상 행동을 말로 중계하듯 들려주세요. "이제 기저귀 갈자~"'], 100, true),
  ('rolling-over', 'gross_motor', 4, 7, '뒤집기를 해요', '등에서 배로, 또는 배에서 등으로 뒤집는 모습이 나타날 수 있어요. 순서와 시기는 아기마다 달라요.', array['바닥에서 자유롭게 움직일 시간을 주세요.', '옆에 좋아하는 장난감을 두어 몸을 돌릴 동기를 만들어 주세요.'], 110, true),
  ('sit-briefly', 'gross_motor', 5, 8, '잠깐 혼자 앉아 있어요', '손으로 바닥을 짚거나 잠깐 동안 혼자 앉아 있는 모습이 보일 수 있어요.', array['쿠션으로 주변을 받쳐 안전한 환경에서 앉는 연습을 해 보세요.'], 120, true),
  ('transfer-hands', 'fine_motor', 6, 8, '물건을 한 손에서 다른 손으로 옮겨요', '장난감을 양손으로 주고받는 모습이 관찰될 수 있어요.', array['양손으로 잡기 좋은 블록이나 링을 건네주세요.'], 130, true),
  ('look-for-dropped', 'cognitive', 6, 9, '떨어뜨린 물건을 찾아요', '떨어진 장난감이 어디 갔는지 눈으로 찾는 모습이 보일 수 있어요.', array['"어디 갔지?" 하고 함께 찾아보는 놀이를 해 보세요.'], 140, true),
  ('name-response', 'language', 6, 9, '이름을 부르면 돌아봐요', '자기 이름에 반응해 고개를 돌리는 모습이 관찰될 수 있어요.', array['아기의 이름을 자주, 다정하게 불러주세요.'], 150, true),
  ('babble-syllables', 'language', 6, 10, '"바바", "마마" 같은 반복 옹알이를 해요', '같은 음절을 반복하는 옹알이가 나타날 수 있어요.', array['아기의 옹알이를 따라 하고, 비슷한 소리로 대답해 주세요.'], 160, true),
  ('stranger-awareness', 'social_emotional', 6, 10, '낯선 사람을 알아봐요', '익숙한 사람과 낯선 사람을 구별하며 낯가림을 보이기도 해요. 낯가림의 정도는 아기마다 달라요.', array['새로운 사람을 만날 때는 부모 품에서 천천히 익숙해질 시간을 주세요.'], 170, true),
  ('crawling', 'gross_motor', 7, 11, '기어서 이동해요', '배밀이, 네발기기, 엉덩이로 밀기 등 다양한 방식으로 이동할 수 있어요. 기기 단계를 건너뛰는 아기도 있어요.', array['바닥에 안전한 공간을 만들고 조금 떨어진 곳에 장난감을 두어 보세요.'], 180, true),
  ('object-permanence', 'cognitive', 8, 11, '숨긴 장난감을 찾아요', '눈앞에서 가려진 물건이 여전히 있다는 것을 알고 찾으려는 모습(대상 영속성)이 관찰될 수 있어요.', array['컵이나 천으로 장난감을 가렸다가 찾게 하는 놀이를 해 보세요.'], 190, true),
  ('pull-to-stand', 'gross_motor', 8, 12, '가구를 잡고 일어서요', '소파나 탁자를 잡고 일어서는 모습이 나타날 수 있어요.', array['잡고 일어설 가구가 넘어지지 않도록 고정해 주세요.'], 200, true),
  ('pincer-grasp', 'fine_motor', 8, 12, '엄지와 검지로 작은 것을 집어요', '작은 물건을 손가락 끝으로 집으려는 모습이 보일 수 있어요.', array['삼키기 어려운 크기의 안전한 핑거푸드로 연습해 보세요. 작은 물건은 손이 닿지 않게 해 주세요.'], 210, true),
  ('peekaboo-play', 'social_emotional', 8, 12, '까꿍 놀이를 즐겨요', '가렸다 나타나는 놀이에 즐거워하는 모습이 관찰될 수 있어요.', array['손이나 손수건으로 얼굴을 가렸다가 "까꿍!" 하고 나타나 보세요.'], 220, true),
  ('gestures', 'language', 9, 12, '손 흔들기 같은 몸짓을 해요', '빠이빠이, 짝짜꿍처럼 몸짓으로 의사를 표현하기 시작할 수 있어요.', array['몸짓과 말을 함께 보여주세요. "빠이빠이~" 하며 손을 흔들어요.'], 230, true),
  ('bang-objects', 'cognitive', 9, 12, '물건을 부딪혀 소리를 내요', '두 물건을 부딪치며 소리의 변화를 탐색할 수 있어요.', array['나무 숟가락과 냄비 뚜껑처럼 안전한 물건으로 소리 놀이를 해 보세요.'], 240, true),
  ('cruising', 'gross_motor', 9, 13, '가구를 잡고 옆으로 걸어요', '가구를 잡고 옆으로 이동하는 모습이 보일 수 있어요.', array['가구 모서리에 보호대를 붙이고 주변을 정리해 주세요.'], 250, true),
  ('in-and-out', 'fine_motor', 10, 13, '물건을 통에 넣고 빼요', '통에 물건을 넣었다가 꺼내는 놀이를 즐길 수 있어요.', array['입구가 넓은 통과 삼킬 수 없는 크기의 공을 준비해 보세요.'], 260, true),
  ('imitation', 'cognitive', 10, 13, '어른의 행동을 따라 해요', '전화 받는 흉내, 빗질 흉내 등 일상 행동을 따라 할 수 있어요.', array['일상 행동을 천천히 보여주고 함께 해 보세요.'], 270, true),
  ('first-steps', 'gross_motor', 11, 15, '혼자 몇 걸음 걸어요', '혼자 몇 걸음 떼는 모습이 나타날 수 있어요. 걷기 시작 시기는 개인차가 매우 커요.', array['맨발로 안전한 바닥을 탐색할 시간을 주세요.'], 280, true),
  ('first-words', 'language', 11, 15, '뜻이 담긴 첫 단어를 말하기도 해요', '"엄마", "아빠"처럼 특정 대상을 가리키는 단어를 말하기도 해요.', array['아기가 가리키는 것의 이름을 짧고 분명하게 말해 주세요.'], 290, true)
on conflict (slug) do update set
  domain = excluded.domain, min_month = excluded.min_month, max_month = excluded.max_month,
  title = excluded.title, description = excluded.description, parent_activities = excluded.parent_activities,
  sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 성장지도 정거장 (흔히 관찰되는 범위, 개인차 큼)
-- -----------------------------------------------------------------------------
insert into public.journey_stops (slug, kind, emoji, title, typical_from_month, typical_to_month, summary, description, tips, sort_order, is_sample) values
  ('birth', 'start', '🌱', '출생', 0, 0, '작은 별이 태어났어요.', '성장 여행의 출발점이에요. 처음 몇 주는 먹고, 자고, 부모와 익숙해지는 시간이에요.', array['아기와 피부를 맞대는 시간을 가져보세요.', '부모의 휴식도 성장 여행의 일부예요.'], 10, true),
  ('eye-contact', 'development', '⭐', '눈맞춤', 0, 2, '가까운 얼굴을 바라보기 시작해요.', '생후 초기에 가까운 거리의 얼굴을 바라보는 모습이 관찰될 수 있어요.', array['20~30cm 거리에서 눈을 맞추며 말을 걸어주세요.'], 20, true),
  ('tummy-time', 'development', '⭐', '터미타임', 0, 3, '깨어 있을 때 엎드려 노는 시간.', '어른이 지켜보는 가운데 깨어 있을 때 짧게 엎드려 노는 시간은 목과 어깨 힘을 기르는 데 도움이 될 수 있어요. 잠은 항상 등을 대고 재워요.', array['하루 몇 번, 짧게 시작해 아기 컨디션에 맞춰 늘려요.', '아기가 힘들어하면 쉬어도 괜찮아요.'], 30, true),
  ('social-smile', 'development', '😊', '첫 미소', 1, 3, '사람을 보고 웃어요.', '부모의 얼굴이나 목소리에 반응해 웃는 모습이 나타날 수 있어요.', array['아기의 미소에 표정과 말로 크게 반응해 주세요.'], 40, true),
  ('head-control', 'development', '⭐', '목 가누기', 3, 5, '머리를 점점 스스로 지탱해요.', '안았을 때 머리를 안정적으로 유지하는 시간이 길어질 수 있어요. 시기는 아기마다 달라요.', array['터미타임을 꾸준히, 즐겁게 이어가요.'], 50, true),
  ('rolling', 'development', '⭐', '뒤집기', 4, 7, '몸을 돌려 세상을 새롭게 봐요.', '뒤집기를 시작하면 이동 범위가 갑자기 넓어질 수 있어요. 침대·소파 낙상에 특히 주의해요.', array['높은 곳에 아기를 혼자 두지 않아요.', '바닥 놀이 시간을 충분히 주세요.'], 60, true),
  ('solid-food', 'food', '🥣', '이유식', 4, 6, '새로운 맛의 세계로.', '이유식 시작 시기는 아기의 준비 신호(목 가누기, 음식에 대한 관심 등)를 보고 정해요. 시작 시기는 소아청소년과와 상담해 보세요.', array['한 번에 한 가지 새로운 재료부터 시작해요.', '처음 먹는 재료는 오전에 소량으로 시도해 보세요.'], 70, true),
  ('sitting', 'development', '⭐', '혼자 앉기', 5, 8, '앉아서 보는 세상은 달라요.', '처음에는 손으로 바닥을 짚고, 점차 혼자 앉는 시간이 늘어날 수 있어요.', array['쿠션으로 주변을 받쳐 안전하게 연습해요.'], 80, true),
  ('first-tooth', 'tooth', '🦷', '첫니', 5, 10, '작은 이가 빼꼼.', '첫니가 나는 시기는 아기마다 차이가 커요. 이가 나기 시작하면 거즈나 유아용 칫솔로 닦아주세요.', array['잇몸이 간지러워하면 차갑게 한 치발기를 줘 보세요.'], 90, true),
  ('crawling', 'development', '⭐', '기기', 7, 11, '스스로 가고 싶은 곳으로.', '배밀이, 네발기기 등 방식은 다양하고, 기기를 건너뛰는 아기도 있어요. 콘센트·작은 물건 안전을 점검해요.', array['바닥의 작은 물건을 치워주세요.', '콘센트 안전 커버를 사용해요.'], 100, true),
  ('pull-to-stand', 'development', '⭐', '잡고 서기', 8, 12, '더 높은 곳을 향해.', '가구를 잡고 일어서는 모습이 나타날 수 있어요. 가구 전도를 예방해 주세요.', array['서랍장·책장은 벽에 고정해요.'], 110, true),
  ('first-steps', 'development', '👣', '첫걸음', 11, 15, '한 걸음, 또 한 걸음.', '첫걸음 시기는 개인차가 매우 커요. 걱정되는 점이 있다면 영유아 건강검진 때 상담해 보세요.', array['맨발로 안전한 바닥을 걸어보게 해요.'], 120, true),
  ('first-birthday', 'celebration', '🎂', '첫돌', 12, 12, '첫 번째 성장 여행 완주!', '태어난 날부터 첫돌까지, 우리 아기가 찾아낸 별들을 돌아보세요.', array['기록한 순간들을 모아 첫 번째 성장지도를 완성해 보세요.'], 130, true)
on conflict (slug) do update set
  kind = excluded.kind, emoji = excluded.emoji, title = excluded.title,
  typical_from_month = excluded.typical_from_month, typical_to_month = excluded.typical_to_month,
  summary = excluded.summary, description = excluded.description, tips = excluded.tips,
  sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 주차별 가이드 (샘플: 일부 주차만 작성. 없는 주차는 가장 가까운 이전 주차를 사용)
-- -----------------------------------------------------------------------------
insert into public.weekly_guides (week, title, development, play, food_tip, life_tip, safety_tip, is_sample) values
  (0, '반가워, 작은 별', '세상에 적응하는 시간이에요. 많이 자고 자주 먹어요.', '품에 안고 심장 소리를 들려주세요.', '수유 간격과 양은 아기마다 달라요. 궁금한 점은 병원에 문의하세요.', '부모도 쉴 수 있을 때 쉬어요.', '잠은 항상 등을 대고, 평평한 곳에서 재워요.', true),
  (1, '서로 알아가는 한 주', '소리와 냄새로 부모를 익혀가요.', '부드러운 목소리로 이야기를 들려주세요.', '수유 기록을 간단히 남겨두면 진료 때 도움이 돼요.', '배꼽 주변을 깨끗하고 건조하게 유지해요.', '목욕물 온도는 팔꿈치로 먼저 확인해요.', true),
  (2, '얼굴을 바라보는 아기', '가까운 얼굴을 바라보는 모습이 보일 수 있어요.', '20~30cm 거리에서 눈을 맞춰보세요.', '트림을 충분히 시켜주세요.', '외출은 아기 컨디션을 보며 짧게 시작해요.', '카시트는 뒤보기로 장착해요.', true),
  (4, '한 달, 첫 번째 별자리', '움직이는 것을 눈으로 따라가기 시작할 수 있어요.', '흑백 대비 카드 보기 놀이를 해보세요.', '수유 리듬이 조금씩 생길 수 있어요.', '영유아 건강검진 일정을 확인해 두세요.', '아기 곁에 베개·이불·인형을 두지 않아요.', true),
  (6, '첫 미소를 기다리며', '사람을 보고 웃는 모습이 나타날 수 있어요.', '아기가 웃으면 크게 반응해 주세요.', '수유 중 아기의 배고픔·배부름 신호를 살펴봐요.', '낮과 밤의 차이를 조명으로 알려주세요.', '흔들어 달래지 말고 부드럽게 안아주세요.', true),
  (8, '옹알이의 시작', '"아", "우" 같은 소리를 낼 수 있어요.', '아기 소리를 따라 하며 대화해 보세요.', '아직은 모유·분유가 주식이에요.', '예방접종 일정을 확인해 보세요.', '소파·침대에 아기를 혼자 두지 않아요.', true),
  (10, '손을 발견했어요', '자기 손을 바라보고 입으로 가져갈 수 있어요.', '손목 딸랑이를 채워 소리를 들려주세요.', '수유 후 바로 눕히기보다 잠시 안아주세요.', '손톱은 아기가 잘 때 다듬어요.', '작은 물건이 아기 주변에 없는지 확인해요.', true),
  (12, '고개를 드는 힘', '터미타임에서 고개를 드는 시간이 늘 수 있어요.', '거울을 보며 터미타임을 해보세요.', '수유량보다 아기의 전반적인 컨디션을 함께 살펴봐요.', '백일을 준비하며 성장 기록을 남겨보세요.', '터미타임은 항상 깨어 있을 때, 어른이 지켜볼 때만 해요.', true),
  (14, '100일의 별', '목을 가누는 힘이 점점 생길 수 있어요.', '누워서 모빌을 보며 손을 뻗어보게 해요.', '이유식 시작 시기를 미리 알아두면 좋아요.', '백일 사진에 오늘의 모습을 기록해 보세요.', '아기띠 사용 시 얼굴이 가려지지 않게 해요.', true),
  (16, '잡고 흔드는 손', '장난감을 잡고 흔들 수 있어요.', '가벼운 딸랑이를 쥐여주세요.', '음식에 관심을 보이는지 관찰해 보세요.', '침이 많아지면 턱받이를 활용해요.', '뒤집기 전후로 낙상 위험이 커져요.', true),
  (18, '뒤집기를 준비해요', '옆으로 몸을 돌리려는 모습이 보일 수 있어요.', '옆에 장난감을 두어 몸을 돌릴 동기를 주세요.', '이유식 준비물을 하나씩 알아봐요.', '수면 루틴을 일정하게 만들어 보세요.', '침대 가드와 바닥 매트를 점검해요.', true),
  (20, '뒤집기 챔피언', '뒤집기를 시도하거나 성공할 수 있어요. 시기는 개인차가 커요.', '바닥에서 자유롭게 구르는 시간을 주세요.', '이유식 시작은 준비 신호를 보고 결정해요.', '뒤집기 후 스스로 못 돌아오면 도와주세요.', '높은 곳에 아기를 혼자 두지 않아요.', true),
  (22, '첫 숟가락', '앉는 자세에 관심을 보일 수 있어요.', '앉힌 채 장난감을 주고받아 보세요.', '첫 재료는 곱게 간 쌀미음처럼 한 가지로 시작해요.', '이유식 시간은 즐거운 분위기로!', '이유식은 반드시 앉은 자세에서 먹여요.', true),
  (24, '반년의 여행', '이름을 부르면 돌아볼 수 있어요.', '이름 부르기 놀이를 해보세요.', '새 재료는 한 번에 한 가지씩 추가해요.', '6개월 영유아 건강검진 시기를 확인하세요.', '카시트 끈 높이를 다시 조절해요.', true),
  (26, '앉아서 보는 세상', '잠깐 혼자 앉을 수 있어요.', '쿠션을 받치고 앉아서 놀아요.', '철분이 풍부한 소고기를 이유식에 활용해 보세요.', '첫니가 보이면 거즈로 닦아주세요.', '앉아 있을 때 뒤로 넘어지지 않게 주변을 받쳐요.', true),
  (28, '두 손으로 척척', '물건을 한 손에서 다른 손으로 옮길 수 있어요.', '블록 주고받기 놀이를 해보세요.', '입자를 조금씩 키워가요.', '낯가림이 시작될 수 있어요.', '작은 부품이 있는 장난감은 치워요.', true),
  (30, '바바 마마', '반복 옹알이가 나타날 수 있어요.', '옹알이를 따라 하며 대화해요.', '중기 이유식 질감에 적응해 가요.', '책 읽어주기를 일상 루틴에 넣어보세요.', '욕조에 아기를 혼자 두지 않아요.', true),
  (32, '배밀이 출발', '배밀이나 기기를 시도할 수 있어요.', '조금 떨어진 곳에 장난감을 두어 보세요.', '다양한 채소를 경험해 보세요.', '바닥 청소를 자주 해주세요.', '콘센트 안전 커버를 사용해요.', true),
  (34, '까꿍!', '가렸다 나타나는 놀이를 즐길 수 있어요.', '까꿍 놀이를 해보세요.', '손으로 잡고 먹는 핑거푸드에 관심을 보일 수 있어요.', '분리불안이 나타날 수 있어요. 인사하고 떠나요.', '문틈 끼임 방지 장치를 확인해요.', true),
  (36, '어디 갔지?', '숨긴 장난감을 찾을 수 있어요.', '컵 속 장난감 찾기 놀이를 해보세요.', '후기 이유식 준비: 조금 더 덩어리 있는 질감.', '낮잠 패턴이 바뀔 수 있어요.', '바닥의 작은 물건을 다시 점검해요.', true),
  (38, '잡고 일어서기', '가구를 잡고 일어서려 할 수 있어요.', '소파를 잡고 서서 놀아보세요.', '하루 세 번 이유식 리듬을 만들어 가요.', '발에 맞는 실내 양말은 미끄럼 방지가 있는 것으로.', '서랍장·책장을 벽에 고정해요.', true),
  (40, '작은 손가락', '엄지와 검지로 작은 것을 집으려 할 수 있어요.', '부드러운 핑거푸드를 집어보게 해요.', '핑거푸드는 쉽게 으깨지는 부드러운 것으로.', '손 씻기를 놀이처럼!', '포도알·견과류처럼 둥글고 단단한 음식은 질식 위험이 있어요.', true),
  (42, '빠이빠이', '손 흔들기 같은 몸짓을 할 수 있어요.', '인사 놀이를 해보세요.', '가족 식탁에 함께 앉아보세요.', '9~10개월 영유아 건강검진 시기를 확인하세요.', '욕실 문은 닫아두세요.', true),
  (44, '옆으로 옆으로', '가구를 잡고 옆으로 걸을 수 있어요.', '소파를 따라 장난감을 옮겨두어 보세요.', '간을 하지 않은 음식을 유지해요.', '신발은 걷기 시작한 뒤 준비해도 늦지 않아요.', '가구 모서리 보호대를 붙여요.', true),
  (46, '따라쟁이', '어른의 행동을 따라 할 수 있어요.', '전화 놀이, 빗질 흉내를 해보세요.', '컵으로 물 마시기를 연습해 보세요.', '칭찬은 구체적으로!', '주방 출입을 막는 안전문을 설치해요.', true),
  (48, '첫 단어를 향해', '뜻이 담긴 말을 하기도 해요. 시기는 아기마다 달라요.', '그림책을 보며 사물 이름을 말해주세요.', '완료기 이유식으로 넘어갈 준비를 해요.', '돌잔치 준비는 부모의 체력에 맞게!', '뜨거운 음료는 식탁 가장자리에 두지 않아요.', true),
  (50, '첫걸음을 기다리며', '혼자 서거나 몇 걸음 뗄 수 있어요.', '양손을 잡고 걸어보기 놀이를 해요.', '가족 식사와 비슷한 식단으로 조금씩 옮겨가요.', '넘어져도 괜찮아요. 격려해 주세요.', '계단 안전문을 확인해요.', true),
  (52, '첫돌, 축하해요!', '1년 동안 정말 많은 별을 찾아냈어요.', '지난 1년의 사진을 함께 보며 이야기해요.', '생우유 시작 시기는 소아청소년과와 상담해 보세요.', '첫 번째 성장지도를 돌아보세요.', '걷기 시작하면 이동 범위가 넓어져요. 집안 안전을 다시 점검해요.', true)
on conflict (week) do update set
  title = excluded.title, development = excluded.development, play = excluded.play,
  food_tip = excluded.food_tip, life_tip = excluded.life_tip, safety_tip = excluded.safety_tip,
  is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 이유식 단계 (참고용, 의료 기준 아님)
-- -----------------------------------------------------------------------------
insert into public.feeding_stages (slug, title, min_month, max_month, texture, frequency, summary, tips, cautions, sort_order, is_sample) values
  ('milk', '모유·분유 시기', 0, 3, '모유 또는 분유', '아기가 원할 때 (간격과 양은 아기마다 달라요)', '이 시기에는 모유나 분유가 아기의 식사예요.', array['배고픔 신호(입맛 다시기, 손 빨기)를 살펴보세요.', '수유 기록을 간단히 남기면 진료 때 도움이 돼요.'], array['수유와 관련해 걱정되는 점은 소아청소년과와 상담하세요.'], 10, true),
  ('early', '초기 이유식', 4, 6, '곱게 갈아 거른 미음 (묽은 상태)', '하루 1회, 한두 숟가락부터', '새로운 맛과 숟가락에 익숙해지는 단계예요. 시작 시기는 아기의 준비 신호를 보고 정해요.', array['쌀미음처럼 한 가지 재료로 시작해요.', '새 재료는 한 번에 하나씩, 며칠 간격을 두고 추가해요.', '아직은 모유·분유가 주된 영양 공급원이에요.'], array['처음 먹는 재료는 오전에 소량으로 시도하고 반응을 살펴보세요.', '간(소금·설탕)을 하지 않아요.', '꿀은 돌 전에는 먹이지 않아요.'], 20, true),
  ('middle', '중기 이유식', 7, 8, '으깬 죽 (작은 알갱이)', '하루 2회', '입자가 조금 있는 죽으로 혀로 으깨 먹는 연습을 해요.', array['소고기 등 철분이 풍부한 재료를 활용해 보세요.', '다양한 채소를 조합해 보세요.'], array['앉은 자세에서 먹여요.', '새 재료는 여전히 한 가지씩 추가해요.'], 30, true),
  ('late', '후기 이유식', 9, 11, '무른 밥, 잘게 다진 재료', '하루 3회 + 간식', '잇몸으로 씹을 수 있는 질감으로, 스스로 집어 먹는 연습도 시작해요.', array['부드러운 핑거푸드로 손으로 집어 먹게 해 보세요.', '가족 식사 시간에 함께 앉아 보세요.'], array['둥글고 단단한 음식(포도알, 견과류 등)은 질식 위험이 있어요.'], 40, true),
  ('complete', '완료기 이유식', 12, 15, '진밥, 작게 썬 반찬', '하루 3회 + 간식 1~2회', '가족 식사와 비슷한 형태로 점차 넘어가요.', array['간은 최소한으로 유지해요.', '컵으로 마시기를 연습해요.'], array['생우유 시작 시기와 양은 소아청소년과와 상담해 보세요.'], 50, true)
on conflict (slug) do update set
  title = excluded.title, min_month = excluded.min_month, max_month = excluded.max_month,
  texture = excluded.texture, frequency = excluded.frequency, summary = excluded.summary,
  tips = excluded.tips, cautions = excluded.cautions, sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 이유식 재료
-- -----------------------------------------------------------------------------
insert into public.foods (slug, name, emoji, category, recommended_from_month, description, nutrition, preparation, pairings, allergy_note, is_common_allergen, is_pantry_staple, sort_order, is_sample) values
  ('rice', '쌀', '🍚', 'grain', 4, '이유식의 첫 재료로 흔히 쓰여요.', '탄수화물 (에너지)', '불린 쌀을 곱게 갈아 물과 함께 끓여 미음으로 만들어요. 단계에 따라 입자를 키워요.', array['beef', 'zucchini', 'potato'], '', false, true, 10, true),
  ('oat', '오트밀', '🌾', 'grain', 6, '부드럽게 퍼지는 곡물이에요.', '탄수화물, 식이섬유', '곱게 갈거나 푹 끓여 부드럽게 만들어요.', array['banana', 'apple'], '귀리는 가공 과정에서 밀과 교차 오염될 수 있어요. 처음에는 소량으로 반응을 살펴보세요.', false, false, 20, true),
  ('potato', '감자', '🥔', 'vegetable', 5, '부드럽고 담백해 다른 재료와 잘 어울려요.', '탄수화물, 비타민 C', '껍질과 싹을 제거하고 푹 쪄서 곱게 으깨요.', array['beef', 'broccoli', 'tofu'], '', false, false, 30, true),
  ('sweet-potato', '고구마', '🍠', 'vegetable', 5, '달콤한 맛으로 아기들이 좋아하는 경우가 많아요.', '탄수화물, 식이섬유, 베타카로틴', '쪄서 껍질을 벗기고 곱게 으깨요.', array['chicken', 'apple'], '', false, false, 40, true),
  ('zucchini', '애호박', '🥒', 'vegetable', 5, '수분이 많고 부드러워 초기부터 흔히 사용해요.', '비타민, 수분', '껍질째 깨끗이 씻어 씨를 빼고 쪄서 곱게 갈아요.', array['beef', 'carrot', 'rice'], '', false, false, 50, true),
  ('carrot', '당근', '🥕', 'vegetable', 5, '달큰한 맛과 선명한 색을 가진 채소예요.', '베타카로틴(비타민 A 전구체), 식이섬유', '껍질을 벗기고 푹 익혀 곱게 갈아요. 기름과 함께 조리하면 좋아요.', array['beef', 'zucchini', 'potato'], '', false, false, 60, true),
  ('broccoli', '브로콜리', '🥦', 'vegetable', 5, '송이 부분을 사용해요.', '비타민 C, 엽산, 식이섬유', '송이만 떼어 흐르는 물에 씻고 푹 데쳐 곱게 다져요.', array['potato', 'beef', 'cauliflower'], '', false, false, 70, true),
  ('cauliflower', '콜리플라워', '🤍', 'vegetable', 6, '부드럽고 순한 맛이에요.', '비타민 C, 식이섬유', '송이만 떼어 푹 익혀 곱게 갈아요.', array['broccoli', 'potato'], '', false, false, 80, true),
  ('pumpkin', '단호박', '🎃', 'vegetable', 5, '달콤하고 부드러운 질감이에요.', '베타카로틴, 식이섬유', '씨를 빼고 쪄서 껍질을 제거한 뒤 으깨요.', array['rice', 'sweet-potato'], '', false, false, 90, true),
  ('cabbage', '양배추', '🥬', 'vegetable', 6, '익히면 단맛이 나요.', '비타민 C, 비타민 K, 식이섬유', '심지를 제거하고 잎 부분을 푹 익혀 다져요.', array['cod', 'beef'], '', false, false, 100, true),
  ('spinach', '시금치', '🌿', 'vegetable', 7, '잎 부분을 데쳐서 사용해요.', '철분, 엽산, 비타민 A', '잎만 데쳐 찬물에 헹군 뒤 곱게 다져요.', array['beef', 'tofu'], '', false, false, 110, true),
  ('radish', '무', '⚪', 'vegetable', 6, '익히면 부드럽고 달큰해요.', '비타민 C, 수분', '껍질을 벗기고 푹 익혀 곱게 다져요.', array['beef', 'rice'], '', false, false, 120, true),
  ('onion', '양파', '🧅', 'vegetable', 7, '익히면 단맛이 나서 맛을 더해줘요.', '식이섬유', '푹 익혀 매운맛을 없앤 뒤 곱게 다져요.', array['beef', 'mushroom'], '', false, false, 130, true),
  ('mushroom', '표고버섯', '🍄', 'vegetable', 8, '감칠맛을 더해주는 재료예요.', '식이섬유, 비타민 D', '기둥을 떼고 갓 부분을 익혀 잘게 다져요.', array['beef', 'onion'], '', false, false, 140, true),
  ('apple', '사과', '🍎', 'fruit', 6, '익히면 부드러운 퓨레가 돼요.', '식이섬유, 비타민 C', '껍질과 씨를 제거하고 쪄서 곱게 갈아요.', array['sweet-potato', 'oat'], '', false, false, 150, true),
  ('pear', '배', '🍐', 'fruit', 6, '수분이 많고 달콤해요.', '수분, 식이섬유', '껍질과 씨를 제거하고 익혀서 갈아요.', array['apple', 'rice'], '', false, false, 160, true),
  ('banana', '바나나', '🍌', 'fruit', 6, '익히지 않아도 부드럽게 으깨져요.', '탄수화물, 칼륨', '잘 익은 바나나를 곱게 으깨요.', array['oat', 'yogurt'], '', false, false, 170, true),
  ('avocado', '아보카도', '🥑', 'fruit', 6, '부드럽고 고소한 과일이에요.', '불포화지방', '잘 익은 과육을 으깨요.', array['banana'], '', false, false, 180, true),
  ('beef', '소고기', '🥩', 'meat', 6, '이유식에서 철분 공급원으로 흔히 활용돼요.', '철분, 단백질, 아연', '기름기 적은 부위를 찬물에 담가 핏물을 빼고 푹 익혀 곱게 다져요.', array['zucchini', 'carrot', 'broccoli'], '', false, false, 190, true),
  ('chicken', '닭고기', '🍗', 'meat', 7, '담백한 안심 부위를 주로 사용해요.', '단백질', '힘줄을 제거한 안심을 푹 익혀 곱게 다져요.', array['sweet-potato', 'carrot'], '', false, false, 200, true),
  ('cod', '대구살', '🐟', 'fish', 7, '흰살생선으로 부드러워요.', '단백질', '뼈와 껍질을 꼼꼼히 제거하고 익혀 으깨요.', array['cabbage', 'potato'], '생선은 흔한 알레르기 유발 식품 중 하나예요. 처음에는 소량으로, 오전에 시도하고 반응을 살펴보세요. 걱정되는 반응이 있으면 소아청소년과와 상담하세요.', true, false, 210, true),
  ('salmon', '연어', '🍣', 'fish', 8, '부드러운 살이 특징이에요.', '단백질, 오메가-3 지방산', '뼈와 껍질을 제거하고 완전히 익혀 으깨요.', array['potato', 'broccoli'], '생선은 흔한 알레르기 유발 식품 중 하나예요. 처음에는 소량으로 시도하고 반응을 살펴보세요.', true, false, 220, true),
  ('egg', '달걀', '🥚', 'egg', 7, '다양한 요리에 활용할 수 있어요.', '단백질, 콜린', '완전히 익혀서 사용해요. 처음에는 노른자부터 소량 시도하는 경우가 많아요.', array['carrot', 'zucchini', 'rice'], '달걀은 흔한 알레르기 유발 식품이에요. 처음에는 완전히 익힌 것을 소량으로, 오전에 시도하고 반응을 살펴보세요. 걱정되는 반응이 있으면 소아청소년과와 상담하세요.', true, false, 230, true),
  ('tofu', '두부', '⬜', 'soy', 7, '부드럽고 단백질이 풍부해요.', '식물성 단백질, 칼슘', '끓는 물에 데친 뒤 으깨거나 작게 썰어요.', array['potato', 'spinach', 'beef'], '콩(대두)은 알레르기 유발 식품 중 하나예요. 처음에는 소량으로 시도하고 반응을 살펴보세요.', true, false, 240, true),
  ('cheese', '아기치즈', '🧀', 'dairy', 9, '염도가 낮은 아기용 치즈를 선택해요.', '칼슘, 단백질', '작게 잘라 죽이나 진밥에 녹여 사용해요.', array['broccoli', 'potato'], '우유 단백질은 흔한 알레르기 유발 식품이에요. 처음에는 소량으로 시도하고 반응을 살펴보세요.', true, false, 250, true),
  ('yogurt', '플레인 요거트', '🥛', 'dairy', 9, '무가당 플레인 제품을 선택해요.', '칼슘, 단백질', '그대로 또는 과일 퓨레와 섞어요.', array['banana', 'apple'], '우유 단백질은 흔한 알레르기 유발 식품이에요. 처음에는 소량으로 시도하고 반응을 살펴보세요.', true, false, 260, true)
on conflict (slug) do update set
  name = excluded.name, emoji = excluded.emoji, category = excluded.category,
  recommended_from_month = excluded.recommended_from_month, description = excluded.description,
  nutrition = excluded.nutrition, preparation = excluded.preparation, pairings = excluded.pairings,
  allergy_note = excluded.allergy_note, is_common_allergen = excluded.is_common_allergen,
  is_pantry_staple = excluded.is_pantry_staple, sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 레시피
-- -----------------------------------------------------------------------------
insert into public.recipes (slug, title, emoji, min_month, max_month, description, servings, texture, cook_minutes, extra_ingredients, steps, allergy_note, sort_order, is_sample) values
  ('rice-porridge', '쌀미음', '🍚', 4, 6, '이유식의 첫걸음, 가장 기본이 되는 미음이에요.', '약 3회분 (1회 30~50ml)', '곱게 갈아 거른 묽은 미음', 30, array['물 200ml'], array['쌀을 30분 이상 불려요.', '불린 쌀을 물과 함께 곱게 갈아요.', '냄비에 넣고 약불에서 저어가며 끓여요.', '체에 한 번 걸러 부드럽게 만들어요.'], '', 10, true),
  ('beef-porridge', '소고기미음', '🥩', 5, 7, '쌀미음에 익숙해진 뒤 소고기를 더해요.', '약 3회분', '곱게 간 미음', 35, array['물 250ml'], array['소고기는 찬물에 담가 핏물을 빼요.', '소고기를 푹 삶아 곱게 갈아요.', '불린 쌀을 곱게 갈아 물과 함께 끓여요.', '갈아둔 소고기를 넣고 한소끔 더 끓여요.'], '', 20, true),
  ('beef-zucchini', '소고기 애호박죽', '🥣', 6, 8, '부드러운 애호박과 소고기가 어우러지는 인기 이유식이에요.', '약 3회분', '작은 알갱이가 있는 죽', 35, array['물 또는 소고기 육수 300ml'], array['불린 쌀을 굵게 갈아요.', '소고기는 핏물을 빼고 익혀 잘게 다져요.', '애호박은 씨를 빼고 익혀 잘게 다져요.', '모든 재료를 냄비에 넣고 저어가며 끓여요.'], '', 30, true),
  ('beef-carrot', '소고기 당근죽', '🥕', 6, 8, '달큰한 당근과 소고기로 만든 죽이에요.', '약 3회분', '작은 알갱이가 있는 죽', 35, array['물 300ml'], array['불린 쌀을 굵게 갈아요.', '소고기는 핏물을 빼고 익혀 다져요.', '당근은 껍질을 벗기고 푹 익혀 다져요.', '재료를 모두 넣고 약불에서 끓여요.'], '', 40, true),
  ('pumpkin-porridge', '단호박죽', '🎃', 5, 7, '달콤한 단호박으로 만드는 부드러운 죽이에요.', '약 3회분', '곱게 간 죽', 30, array['물 250ml'], array['단호박은 씨를 빼고 쪄서 껍질을 벗겨요.', '불린 쌀을 곱게 갈아요.', '단호박과 쌀을 물과 함께 끓여요.'], '', 50, true),
  ('broccoli-potato', '브로콜리 감자죽', '🥦', 6, 8, '포슬한 감자와 브로콜리의 조합이에요.', '약 3회분', '작은 알갱이가 있는 죽', 30, array['물 300ml'], array['감자는 껍질과 싹을 제거하고 쪄서 으깨요.', '브로콜리 송이는 데쳐서 잘게 다져요.', '불린 쌀과 함께 넣고 끓여요.'], '', 60, true),
  ('potato-tofu', '감자 두부죽', '⬜', 7, 9, '부드러운 두부로 단백질을 더한 죽이에요.', '약 3회분', '작은 알갱이가 있는 죽', 30, array['물 300ml'], array['감자는 쪄서 으깨요.', '두부는 데친 뒤 으깨요.', '불린 쌀과 함께 넣고 끓여요.'], '두부(대두)를 처음 먹는다면 다른 새 재료 없이 소량으로 시작해 보세요.', 70, true),
  ('chicken-sweet-potato', '닭고기 고구마죽', '🍠', 7, 9, '달콤한 고구마와 담백한 닭고기의 조합이에요.', '약 3회분', '작은 알갱이가 있는 죽', 35, array['물 300ml'], array['닭안심은 힘줄을 제거하고 삶아 다져요.', '고구마는 쪄서 으깨요.', '불린 쌀과 함께 넣고 끓여요.'], '', 80, true),
  ('cod-cabbage', '대구살 양배추죽', '🐟', 7, 9, '흰살생선과 양배추로 만든 부드러운 죽이에요.', '약 3회분', '작은 알갱이가 있는 죽', 35, array['물 300ml'], array['대구살은 뼈를 꼼꼼히 제거하고 익혀 으깨요.', '양배추 잎은 푹 익혀 다져요.', '불린 쌀과 함께 넣고 끓여요.'], '생선을 처음 먹는다면 다른 새 재료 없이 소량으로 시작해 보세요.', 90, true),
  ('apple-puree', '사과 퓨레', '🍎', 6, 8, '간식으로 좋은 부드러운 퓨레예요.', '약 2회분', '곱게 간 퓨레', 15, array[]::text[], array['사과 껍질과 씨를 제거해요.', '찜기에 푹 쪄요.', '곱게 갈아요.'], '', 100, true),
  ('banana-oat', '바나나 오트밀죽', '🍌', 7, 10, '불 없이도 금방 만드는 간식 죽이에요.', '약 2회분', '부드러운 죽', 15, array['물 또는 분유 150ml'], array['오트밀을 물과 함께 푹 끓여요.', '잘 익은 바나나를 으깨 넣어 섞어요.'], '', 110, true),
  ('egg-veggie-rice', '달걀 채소 진밥', '🥚', 9, 12, '후기 이유식에 좋은 한 그릇 메뉴예요.', '약 2회분', '무른 진밥', 25, array['물 200ml'], array['당근과 애호박을 잘게 다져요.', '진밥에 채소와 물을 넣고 끓여요.', '완전히 익힌 달걀을 풀어 넣고 충분히 익혀요.'], '달걀을 처음 먹는다면 완전히 익힌 것을 소량으로 시작해 보세요.', 120, true),
  ('beef-mushroom-rice', '소고기 표고 진밥', '🍄', 10, 12, '감칠맛 나는 표고와 소고기 진밥이에요.', '약 2회분', '무른 진밥', 30, array['물 200ml'], array['소고기는 핏물을 빼고 다져요.', '표고버섯과 양파를 잘게 다져요.', '진밥에 모든 재료와 물을 넣고 푹 끓여요.'], '', 130, true)
on conflict (slug) do update set
  title = excluded.title, emoji = excluded.emoji, min_month = excluded.min_month, max_month = excluded.max_month,
  description = excluded.description, servings = excluded.servings, texture = excluded.texture,
  cook_minutes = excluded.cook_minutes, extra_ingredients = excluded.extra_ingredients, steps = excluded.steps,
  allergy_note = excluded.allergy_note, sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- 레시피 ↔ 재료 (recipe slug, food slug, amount, optional, sort)
insert into public.recipe_ingredients (recipe_id, food_id, amount, is_optional, sort_order)
select r.id, f.id, v.amount, v.is_optional, v.sort_order
from (values
  ('rice-porridge', 'rice', '불린 쌀 20g', false, 1),
  ('beef-porridge', 'rice', '불린 쌀 20g', false, 1),
  ('beef-porridge', 'beef', '10g', false, 2),
  ('beef-zucchini', 'rice', '불린 쌀 30g', false, 1),
  ('beef-zucchini', 'beef', '15g', false, 2),
  ('beef-zucchini', 'zucchini', '20g', false, 3),
  ('beef-carrot', 'rice', '불린 쌀 30g', false, 1),
  ('beef-carrot', 'beef', '15g', false, 2),
  ('beef-carrot', 'carrot', '15g', false, 3),
  ('pumpkin-porridge', 'rice', '불린 쌀 20g', false, 1),
  ('pumpkin-porridge', 'pumpkin', '30g', false, 2),
  ('broccoli-potato', 'rice', '불린 쌀 30g', false, 1),
  ('broccoli-potato', 'broccoli', '15g', false, 2),
  ('broccoli-potato', 'potato', '20g', false, 3),
  ('potato-tofu', 'rice', '불린 쌀 30g', false, 1),
  ('potato-tofu', 'potato', '20g', false, 2),
  ('potato-tofu', 'tofu', '20g', false, 3),
  ('chicken-sweet-potato', 'rice', '불린 쌀 30g', false, 1),
  ('chicken-sweet-potato', 'chicken', '15g', false, 2),
  ('chicken-sweet-potato', 'sweet-potato', '20g', false, 3),
  ('cod-cabbage', 'rice', '불린 쌀 30g', false, 1),
  ('cod-cabbage', 'cod', '15g', false, 2),
  ('cod-cabbage', 'cabbage', '15g', false, 3),
  ('apple-puree', 'apple', '1/2개', false, 1),
  ('banana-oat', 'oat', '15g', false, 1),
  ('banana-oat', 'banana', '1/2개', false, 2),
  ('egg-veggie-rice', 'rice', '진밥 80g', false, 1),
  ('egg-veggie-rice', 'egg', '1/2개', false, 2),
  ('egg-veggie-rice', 'carrot', '10g', false, 3),
  ('egg-veggie-rice', 'zucchini', '10g', true, 4),
  ('beef-mushroom-rice', 'rice', '진밥 80g', false, 1),
  ('beef-mushroom-rice', 'beef', '20g', false, 2),
  ('beef-mushroom-rice', 'mushroom', '10g', false, 3),
  ('beef-mushroom-rice', 'onion', '10g', true, 4)
) as v(recipe_slug, food_slug, amount, is_optional, sort_order)
join public.recipes r on r.slug = v.recipe_slug
join public.foods f on f.slug = v.food_slug
on conflict (recipe_id, food_id) do update set
  amount = excluded.amount, is_optional = excluded.is_optional, sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- 놀이
-- -----------------------------------------------------------------------------
insert into public.activities (slug, title, emoji, categories, min_month, max_month, description, materials, duration_minutes, steps, cautions, sort_order, is_sample) values
  ('high-contrast-cards', '흑백 카드 보기', '🖤', array['cognitive', 'sensory'], 0, 3, '대비가 뚜렷한 그림을 보며 시각을 자극해요.', '흑백 대비 카드 또는 그림책', 3, array['아기 눈에서 20~30cm 거리에 카드를 보여줘요.', '천천히 좌우로 움직여요.', '아기가 고개를 돌리면 쉬어요.'], array['아기가 피곤해하면 바로 멈춰요.'], 10, true),
  ('face-talk', '얼굴 보며 말 걸기', '🗣️', array['language', 'social'], 0, 4, '부모의 얼굴과 목소리는 아기에게 가장 좋은 장난감이에요.', '없음', 5, array['아기를 안고 눈을 맞춰요.', '천천히, 다양한 억양으로 말을 걸어요.', '아기가 소리를 내면 잠시 기다렸다가 대답해요.'], array[]::text[], 20, true),
  ('rattle-follow', '딸랑이 따라보기', '🔔', array['cognitive', 'sensory'], 1, 4, '소리 나는 쪽으로 고개를 돌리고 눈으로 따라가요.', '딸랑이', 3, array['아기 옆에서 딸랑이를 살짝 흔들어요.', '아기가 쳐다보면 반대쪽으로 천천히 옮겨요.'], array['소리를 너무 크게 내지 않아요.'], 30, true),
  ('tummy-time-mirror', '거울 보며 터미타임', '🪞', array['gross_motor', 'social'], 1, 5, '거울 속 얼굴을 보며 고개를 드는 연습을 해요.', '깨지지 않는 아기용 거울, 매트', 5, array['아기가 깨어 있을 때 매트 위에 엎드려 놓아요.', '아기 앞에 거울을 세워둬요.', '옆에서 함께 거울을 보며 말을 걸어요.'], array['반드시 어른이 지켜보는 가운데 해요.', '아기가 힘들어하면 바로 멈춰요.'], 40, true),
  ('reach-and-grab', '장난감 잡기', '✋', array['fine_motor'], 3, 6, '손을 뻗어 장난감을 잡는 연습을 해요.', '가볍고 잡기 쉬운 장난감', 5, array['아기 손이 닿을 듯한 거리에 장난감을 보여줘요.', '손을 뻗으면 칭찬해 줘요.', '잡으면 흔들어보게 해요.'], array['삼킬 수 있는 작은 장난감은 사용하지 않아요.'], 50, true),
  ('rolling-play', '데굴데굴 뒤집기 놀이', '🔄', array['gross_motor'], 4, 7, '몸을 돌리고 싶은 동기를 만들어요.', '좋아하는 장난감, 매트', 5, array['아기를 바닥 매트에 눕혀요.', '옆쪽에 장난감을 두어 시선을 끌어요.', '몸을 돌리려 하면 응원해 줘요.'], array['침대나 소파가 아닌 바닥에서 해요.'], 60, true),
  ('texture-play', '촉감 천 놀이', '🧣', array['sensory', 'fine_motor'], 4, 9, '다양한 촉감을 손으로 느껴봐요.', '면, 니트, 실크 등 다양한 천 조각', 5, array['천 조각을 하나씩 건네요.', '"부드럽다", "까슬까슬하다" 말로 표현해 줘요.'], array['천 조각이 얼굴을 덮지 않게 지켜봐요.'], 70, true),
  ('finger-songs', '노래와 손유희', '🎵', array['language', 'social'], 3, 12, '리듬과 반복 속에서 말소리를 익혀요.', '없음', 5, array['짝짜꿍, 곤지곤지 같은 손유희를 해요.', '같은 노래를 반복해서 불러줘요.'], array[]::text[], 80, true),
  ('peekaboo', '까꿍 놀이', '🙈', array['social', 'cognitive'], 6, 12, '사라졌다 나타나는 즐거움을 느껴요.', '손수건', 5, array['손수건으로 얼굴을 가려요.', '"어디 있지?" 하고 잠시 기다려요.', '"까꿍!" 하며 나타나요.'], array['손수건으로 아기 얼굴을 덮은 채 두지 않아요.'], 90, true),
  ('picture-book-naming', '그림책 이름 말하기', '📚', array['language'], 6, 12, '그림을 가리키며 이름을 들려줘요.', '보드북', 5, array['아기와 함께 그림책을 펼쳐요.', '그림을 가리키며 짧게 이름을 말해요.', '아기가 가리키면 이름을 다시 말해줘요.'], array[]::text[], 100, true),
  ('pot-drum', '냄비 드럼', '🥁', array['sensory', 'cognitive'], 7, 12, '두드리면 소리가 나는 원리를 탐색해요.', '냄비, 나무 숟가락', 5, array['냄비를 뒤집어 바닥에 둬요.', '나무 숟가락으로 두드리는 시범을 보여요.', '아기가 따라 하면 함께 박자를 맞춰요.'], array['무겁거나 날카로운 조리도구는 사용하지 않아요.'], 110, true),
  ('cushion-hill', '쿠션 언덕 넘기', '⛰️', array['gross_motor'], 7, 11, '낮은 쿠션을 넘으며 기는 힘을 길러요.', '낮고 단단한 쿠션', 10, array['바닥에 쿠션을 낮게 놓아요.', '반대편에 장난감을 둬요.', '아기가 넘어오면 크게 칭찬해요.'], array['주변에 모서리나 딱딱한 물건이 없게 해요.', '항상 옆에서 지켜봐요.'], 120, true),
  ('object-permanence-cup', '컵 속 장난감 찾기', '🥤', array['cognitive', 'fine_motor', 'sensory'], 8, 10, '가려진 장난감을 찾으며 "보이지 않아도 있다"는 것을 경험해요.', '컵 + 안전한 장난감', 5, array['아기에게 장난감을 보여준다.', '컵으로 장난감을 가린다.', '아기가 찾을 시간을 준다.'], array['삼킬 수 있는 작은 장난감은 사용하지 않아요.', '깨지지 않는 컵을 사용해요.'], 130, true),
  ('stacking-cups', '컵 쌓고 무너뜨리기', '🧱', array['fine_motor', 'cognitive'], 8, 12, '쌓고 무너뜨리며 원인과 결과를 경험해요.', '플라스틱 컵 여러 개', 5, array['컵을 2~3개 쌓아 보여줘요.', '아기가 무너뜨리면 함께 즐거워해요.', '다시 쌓아보기를 반복해요.'], array[]::text[], 140, true),
  ('ball-roll', '공 굴려 주고받기', '⚽', array['social', 'gross_motor'], 8, 12, '주고받기를 통해 차례를 경험해요.', '부드러운 공', 5, array['아기와 마주 앉아요.', '공을 천천히 굴려줘요.', '아기가 밀어내면 다시 굴려줘요.'], array[]::text[], 150, true),
  ('in-and-out-box', '통에 넣고 빼기', '📦', array['fine_motor', 'cognitive'], 9, 12, '넣고 빼는 반복 놀이로 손 조절력을 길러요.', '입구가 넓은 통, 큰 공이나 블록', 5, array['통에 공을 넣는 시범을 보여요.', '아기가 꺼내면 다시 넣어보게 해요.'], array['삼킬 수 없는 크기의 물건만 사용해요.'], 160, true),
  ('push-walk', '밀며 걷기', '🛒', array['gross_motor'], 10, 14, '무게감 있는 상자를 밀며 걸음을 연습해요.', '무거운 책을 넣은 튼튼한 상자', 10, array['상자 안에 책을 넣어 무게를 줘요.', '아기가 상자를 잡고 밀어보게 해요.'], array['미끄럽지 않은 바닥에서 해요.', '계단 근처에서는 하지 않아요.'], 170, true)
on conflict (slug) do update set
  title = excluded.title, emoji = excluded.emoji, categories = excluded.categories,
  min_month = excluded.min_month, max_month = excluded.max_month, description = excluded.description,
  materials = excluded.materials, duration_minutes = excluded.duration_minutes, steps = excluded.steps,
  cautions = excluded.cautions, sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 안전 정보
-- -----------------------------------------------------------------------------
insert into public.safety_guides (slug, title, emoji, trigger_label, min_month, max_month, summary, checklist, sort_order, is_sample) values
  ('safe-sleep', '안전한 잠자리', '🛏️', '태어난 날부터', 0, 12, '아기는 등을 대고, 단단하고 평평한 곳에서 혼자 재워요.', array['등을 대고 눕혀 재워요.', '단단하고 평평한 매트리스를 사용해요.', '베개·이불·인형·범퍼를 잠자리에 두지 않아요.', '너무 덥지 않게 실내 온도를 유지해요.'], 10, true),
  ('car-seat', '카시트', '🚗', '첫 외출부터', 0, 12, '차량 이동 시 월령과 체중에 맞는 카시트를 사용해요.', array['영아는 뒤보기로 장착해요.', '어깨끈이 느슨하지 않은지 확인해요.', '두꺼운 외투는 벗기고 태워요.'], 20, true),
  ('bath', '목욕 안전', '🛁', '목욕 시간', 0, 12, '목욕 중에는 잠시라도 아기를 혼자 두지 않아요.', array['물 온도를 먼저 확인해요.', '필요한 물건을 미리 준비해 두어요.', '초인종이 울려도 아기를 안고 이동해요.'], 30, true),
  ('rolling-falls', '뒤집기 시기 낙상', '🛋️', '뒤집기 시기', 3, 8, '갑자기 뒤집어 침대나 소파에서 떨어질 수 있어요.', array['침대·소파·기저귀 교환대에 아기를 혼자 두지 않아요.', '바닥 매트를 깔아 두어요.', '아기 주변에 떨어질 수 있는 공간이 없는지 확인해요.'], 40, true),
  ('solid-food-choking', '이유식 질식 예방', '🥄', '이유식 시작', 4, 12, '먹는 동안에는 항상 곁에서 지켜봐요.', array['반드시 앉은 자세에서 먹여요.', '둥글고 단단한 음식(포도알, 견과류, 방울토마토 등)은 작게 자르거나 피해요.', '먹는 중에 눕거나 돌아다니지 않게 해요.'], 50, true),
  ('crawling-hazards', '기기 시작 · 콘센트와 작은 물건', '🔌', '기기 시작', 6, 12, '손이 닿는 모든 것을 입에 넣을 수 있어요.', array['콘센트 안전 커버를 사용해요.', '동전·단추형 전지·자석 등 작은 물건을 치워요.', '전선을 정리해요.', '아기 눈높이로 엎드려 집안을 점검해 보세요.'], 60, true),
  ('furniture-tip', '잡고 서기 · 가구 전도', '🗄️', '잡고 서기', 8, 14, '잡고 일어설 때 가구가 넘어질 수 있어요.', array['서랍장·책장·TV를 벽에 고정해요.', '가구 모서리에 보호대를 붙여요.', '식탁보처럼 잡아당길 수 있는 천을 치워요.'], 70, true),
  ('mobility-rooms', '이동 증가 · 계단·욕실·주방', '🚪', '이동 증가', 9, 14, '이동 범위가 넓어지면 위험한 공간에 들어갈 수 있어요.', array['계단 위아래에 안전문을 설치해요.', '욕실 문은 닫고 변기 뚜껑을 내려둬요.', '주방 출입을 막고 뜨거운 음료를 멀리 둬요.', '세제·약은 잠금장치가 있는 높은 곳에 보관해요.'], 80, true)
on conflict (slug) do update set
  title = excluded.title, emoji = excluded.emoji, trigger_label = excluded.trigger_label,
  min_month = excluded.min_month, max_month = excluded.max_month, summary = excluded.summary,
  checklist = excluded.checklist, sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 예방접종 (⚠️ 샘플 · 검증 전)
--   질병관리청 표준예방접종일정표의 일반적인 구성을 참고한 예시.
--   data_reference_date 는 의도적으로 비워 둔다 → 화면에 "기준일 미확인(샘플)" 으로 표시.
-- -----------------------------------------------------------------------------
insert into public.vaccines (slug, name, disease, dose_number, dose_label, min_age_days, recommended_from_months, recommended_from_days, recommended_to_months, recommended_to_days, recommended_label, description, is_national, data_reference_date, sort_order, is_sample) values
  ('hepb-1', 'HepB', 'B형간염', 1, '1차', 0, 0, 0, 0, 0, '출생 시', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 10, true),
  ('bcg-1', 'BCG(피내용)', '결핵', 1, '1회', 0, 0, 0, 0, 28, '생후 4주 이내', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 20, true),
  ('hepb-2', 'HepB', 'B형간염', 2, '2차', null, 1, 0, 1, 0, '생후 1개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 30, true),
  ('dtap-1', 'DTaP', '디프테리아·파상풍·백일해', 1, '1차', 42, 2, 0, 2, 0, '생후 2개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 40, true),
  ('ipv-1', 'IPV', '폴리오', 1, '1차', 42, 2, 0, 2, 0, '생후 2개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 50, true),
  ('hib-1', 'Hib', 'b형 헤모필루스 인플루엔자', 1, '1차', 42, 2, 0, 2, 0, '생후 2개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 60, true),
  ('pcv-1', 'PCV', '폐렴구균', 1, '1차', 42, 2, 0, 2, 0, '생후 2개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 70, true),
  ('rv-1', 'RV', '로타바이러스 감염증', 1, '1차', 42, 2, 0, 2, 0, '생후 2개월', '샘플 데이터: 백신 종류에 따라 접종 횟수가 달라요. 공식 일정표로 검증 후 사용하세요.', true, null, 80, true),
  ('dtap-2', 'DTaP', '디프테리아·파상풍·백일해', 2, '2차', null, 4, 0, 4, 0, '생후 4개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 90, true),
  ('ipv-2', 'IPV', '폴리오', 2, '2차', null, 4, 0, 4, 0, '생후 4개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 100, true),
  ('hib-2', 'Hib', 'b형 헤모필루스 인플루엔자', 2, '2차', null, 4, 0, 4, 0, '생후 4개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 110, true),
  ('pcv-2', 'PCV', '폐렴구균', 2, '2차', null, 4, 0, 4, 0, '생후 4개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 120, true),
  ('rv-2', 'RV', '로타바이러스 감염증', 2, '2차', null, 4, 0, 4, 0, '생후 4개월', '샘플 데이터: 백신 종류에 따라 접종 횟수가 달라요. 공식 일정표로 검증 후 사용하세요.', true, null, 130, true),
  ('hepb-3', 'HepB', 'B형간염', 3, '3차', null, 6, 0, 6, 0, '생후 6개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 140, true),
  ('dtap-3', 'DTaP', '디프테리아·파상풍·백일해', 3, '3차', null, 6, 0, 6, 0, '생후 6개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 150, true),
  ('ipv-3', 'IPV', '폴리오', 3, '3차', null, 6, 0, 18, 0, '생후 6~18개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 160, true),
  ('hib-3', 'Hib', 'b형 헤모필루스 인플루엔자', 3, '3차', null, 6, 0, 6, 0, '생후 6개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 170, true),
  ('pcv-3', 'PCV', '폐렴구균', 3, '3차', null, 6, 0, 6, 0, '생후 6개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 180, true),
  ('rv-3', 'RV', '로타바이러스 감염증', 3, '3차 (해당 백신만)', null, 6, 0, 6, 0, '생후 6개월 (백신 종류에 따라)', '샘플 데이터: 3회 접종 백신에만 해당돼요. 공식 일정표로 검증 후 사용하세요.', true, null, 190, true),
  ('hib-4', 'Hib', 'b형 헤모필루스 인플루엔자', 4, '4차', null, 12, 0, 15, 0, '생후 12~15개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 200, true),
  ('pcv-4', 'PCV', '폐렴구균', 4, '4차', null, 12, 0, 15, 0, '생후 12~15개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 210, true),
  ('mmr-1', 'MMR', '홍역·유행성이하선염·풍진', 1, '1차', null, 12, 0, 15, 0, '생후 12~15개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 220, true),
  ('var-1', 'VAR', '수두', 1, '1회', null, 12, 0, 15, 0, '생후 12~15개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 230, true),
  ('hepa-1', 'HepA', 'A형간염', 1, '1차', null, 12, 0, 23, 0, '생후 12~23개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 240, true),
  ('dtap-4', 'DTaP', '디프테리아·파상풍·백일해', 4, '4차', null, 15, 0, 18, 0, '생후 15~18개월', '샘플 데이터: 공식 일정표로 검증 후 사용하세요.', true, null, 250, true)
on conflict (slug) do update set
  name = excluded.name, disease = excluded.disease, dose_number = excluded.dose_number,
  dose_label = excluded.dose_label, min_age_days = excluded.min_age_days,
  recommended_from_months = excluded.recommended_from_months, recommended_from_days = excluded.recommended_from_days,
  recommended_to_months = excluded.recommended_to_months, recommended_to_days = excluded.recommended_to_days,
  recommended_label = excluded.recommended_label, description = excluded.description,
  is_national = excluded.is_national, data_reference_date = excluded.data_reference_date,
  sort_order = excluded.sort_order, is_sample = excluded.is_sample;

-- -----------------------------------------------------------------------------
-- 콘텐츠 ↔ 출처 연결
--   샘플 콘텐츠는 "편집팀(검토 전)" + 참고 기관 출처를 함께 연결한다.
-- -----------------------------------------------------------------------------
insert into public.content_source_relations (source_id, content_type, content_id)
select c.source_id::uuid, c.content_type, c.id
from (
  select '00000000-0000-4000-8000-000000000005' as source_id, 'development_item' as content_type, id from public.development_items
  union all select '00000000-0000-4000-8000-000000000002', 'development_item', id from public.development_items
  union all select '00000000-0000-4000-8000-000000000005', 'journey_stop', id from public.journey_stops
  union all select '00000000-0000-4000-8000-000000000002', 'journey_stop', id from public.journey_stops
  union all select '00000000-0000-4000-8000-000000000005', 'weekly_guide', id from public.weekly_guides
  union all select '00000000-0000-4000-8000-000000000005', 'feeding_stage', id from public.feeding_stages
  union all select '00000000-0000-4000-8000-000000000003', 'feeding_stage', id from public.feeding_stages
  union all select '00000000-0000-4000-8000-000000000005', 'food', id from public.foods
  union all select '00000000-0000-4000-8000-000000000005', 'recipe', id from public.recipes
  union all select '00000000-0000-4000-8000-000000000005', 'activity', id from public.activities
  union all select '00000000-0000-4000-8000-000000000005', 'safety_guide', id from public.safety_guides
  union all select '00000000-0000-4000-8000-000000000004', 'safety_guide', id from public.safety_guides
  union all select '00000000-0000-4000-8000-000000000001', 'vaccine', id from public.vaccines
) as c(source_id, content_type, id)
on conflict (source_id, content_type, content_id) do nothing;
