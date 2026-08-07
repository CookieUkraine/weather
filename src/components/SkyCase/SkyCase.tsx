import { useRef, useState } from "react";
import styled from "styled-components";
import { CASE_ITEMS, TIER_COLOR, TIER_LABEL, weightedPick, CaseItem, Tier } from "./caseItems";

const SLOT_WIDTH = 104 + 12; // item width + gap
const REEL_LENGTH = 60;
const TARGET_INDEX = 50;

export function SkyCase() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [openedCount, setOpenedCount] = useState(0);
  const [result, setResult] = useState<CaseItem | null>(null);
  const [reelItems, setReelItems] = useState<CaseItem[]>(() =>
    Array.from({ length: 12 }, weightedPick)
  );

  const stripRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  function openModal() {
    setIsOpen(true);
    setResult(null);
    setReelItems(Array.from({ length: 12 }, weightedPick));
    if (stripRef.current) {
      stripRef.current.style.transition = "none";
      stripRef.current.style.transform = "translateX(0px)";
    }
  }

  function closeModal() {
    if (!isSpinning) setIsOpen(false);
  }

  function handleOpenCase() {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null);

    const winner = weightedPick();
    const items: CaseItem[] = Array.from({ length: REEL_LENGTH }, (_, i) =>
      i === TARGET_INDEX ? winner : weightedPick()
    );
    setReelItems(items);

    requestAnimationFrame(() => {
      const strip = stripRef.current;
      const wrap = wrapRef.current;
      if (!strip || !wrap) return;

      strip.style.transition = "none";
      strip.style.transform = "translateX(0px)";
      void strip.offsetWidth; // force reflow so the transition applies cleanly

      const wrapWidth = wrap.offsetWidth;
      const jitter = Math.random() * 40 - 20;
      const targetOffset =
        TARGET_INDEX * SLOT_WIDTH + SLOT_WIDTH / 2 - wrapWidth / 2 + jitter;

      strip.style.transition = "transform 4.2s cubic-bezier(0.12, 0.88, 0.2, 1)";
      strip.style.transform = `translateX(-${targetOffset}px)`;
    });

    setTimeout(() => {
      setIsSpinning(false);
      setOpenedCount((c) => c + 1);
      setResult(winner);
    }, 4300);
  }

  return (
    <>
      <OpenButton onClick={openModal}>
        <Ico>🎁</Ico> Open Sky Case
      </OpenButton>

      {isOpen && (
        <Overlay onMouseDown={(e) => e.target === e.currentTarget && closeModal()}>
          <Modal>
            <ModalHead>
              <ModalTitle>
                Sky Case <span>// Weather Drop</span>
              </ModalTitle>
              <CloseBtn onClick={closeModal} aria-label="Close">
                ✕
              </CloseBtn>
            </ModalHead>
            <ModalSub>
              Open the case to pull a weather condition. Legendary drops are rare — just
              like a real snow day.
            </ModalSub>

            <ReelWrap ref={wrapRef}>
              <ReelPointer />
              <ReelStrip ref={stripRef}>
                {reelItems.map((item, i) => (
                  <ReelItemBox key={i} $tier={item.tier}>
                    <RIcon>{item.icon}</RIcon>
                    <RName>{item.name}</RName>
                  </ReelItemBox>
                ))}
              </ReelStrip>
            </ReelWrap>

            <RarityLegend>
              {(Object.keys(TIER_LABEL) as Tier[]).map((t) => {
                const totalChance = CASE_ITEMS.filter((i) => i.tier === t).reduce(
                  (sum, i) => sum + i.chance,
                  0
                );
                return (
                  <Chip key={t}>
                    <Swatch style={{ background: TIER_COLOR[t] }} />
                    {TIER_LABEL[t]} · {totalChance}%
                  </Chip>
                );
              })}
            </RarityLegend>

            <OpenControls>
              <OpenMainBtn onClick={handleOpenCase} disabled={isSpinning}>
                Open Case
              </OpenMainBtn>
              <HistoryNote>
                {openedCount} case{openedCount === 1 ? "" : "s"} opened this session
              </HistoryNote>
            </OpenControls>

            {result && (
              <ResultPanel>
                <ResultIcon $tier={result.tier}>{result.icon}</ResultIcon>
                <div>
                  <ResultName>{result.name}</ResultName>
                  <ResultTier style={{ color: TIER_COLOR[result.tier] }}>
                    {TIER_LABEL[result.tier].toUpperCase()}
                  </ResultTier>
                  <ResultFlavor>{result.flavor}</ResultFlavor>
                </div>
              </ResultPanel>
            )}
          </Modal>
        </Overlay>
      )}
    </>
  );
}

/* ---------------------------- styled components --------------------------- */

const OpenButton = styled.button`
  display: flex;
  align-items: center;
  gap: 9px;
  background: linear-gradient(180deg, #1f3260, #0f1b33);
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #f3f6ff;
  padding: 10px 16px 10px 12px;
  border-radius: 11px;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 20px -10px rgba(0, 0, 0, 0.6);
  transition: transform 0.15s ease, border-color 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: rgba(124, 92, 255, 0.5);
  }
  &:focus-visible {
    outline: 2px solid #4f8fe8;
    outline-offset: 2px;
  }
`;

const Ico = styled.span`
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: linear-gradient(135deg, #ffc94a, #a9781f);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(4, 7, 14, 0.78);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 20px;
`;

const Modal = styled.div`
  width: 100%;
  max-width: 760px;
  background: linear-gradient(180deg, #0f1b33, #060a14);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 20px;
  padding: 26px 26px 22px;
  box-shadow: 0 30px 80px -20px rgba(0, 0, 0, 0.7);
  color: #f3f6ff;
`;

const ModalHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
`;

const ModalTitle = styled.div`
  font-size: 18px;
  font-weight: 700;
  span {
    color: #ffc94a;
  }
`;

const CloseBtn = styled.button`
  background: none;
  border: 1px solid rgba(255, 255, 255, 0.09);
  color: #93a0c4;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;

  &:hover {
    color: #f3f6ff;
    border-color: #e8478b;
  }
`;

const ModalSub = styled.div`
  font-size: 12.5px;
  color: #93a0c4;
  margin-bottom: 20px;
`;

const ReelWrap = styled.div`
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  background: #060a14;
  height: 132px;

  &::before,
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
    z-index: 3;
    pointer-events: none;
  }
  &::before {
    left: 0;
    background: linear-gradient(90deg, #060a14, transparent);
  }
  &::after {
    right: 0;
    background: linear-gradient(270deg, #060a14, transparent);
  }
`;

const ReelPointer = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: #ffc94a;
  z-index: 4;
  box-shadow: 0 0 14px 2px rgba(255, 201, 74, 0.7);

  &::before,
  &::after {
    content: "";
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
  }
  &::before {
    top: -1px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-top: 8px solid #ffc94a;
  }
  &::after {
    bottom: -1px;
    border-left: 7px solid transparent;
    border-right: 7px solid transparent;
    border-bottom: 8px solid #ffc94a;
  }
`;

const ReelStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  height: 100%;
  will-change: transform;
  transform: translateX(0px);
`;

const ReelItemBox = styled.div<{ $tier: Tier }>`
  flex: 0 0 auto;
  width: 104px;
  height: 100%;
  border-radius: 11px;
  border: 1px solid ${(p) => TIER_COLOR[p.$tier]};
  background: linear-gradient(180deg, ${(p) => TIER_COLOR[p.$tier]}30, #0f1b33);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const RIcon = styled.div`
  font-size: 30px;
`;

const RName = styled.div`
  font-size: 10px;
  color: #93a0c4;
  font-weight: 600;
  text-align: center;
  padding: 0 4px;
`;

const RarityLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const Chip = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #93a0c4;
  border: 1px solid rgba(255, 255, 255, 0.09);
  padding: 5px 10px;
  border-radius: 20px;
`;

const Swatch = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
`;

const OpenControls = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  gap: 12px;
  flex-wrap: wrap;
`;

const OpenMainBtn = styled.button`
  background: linear-gradient(180deg, #ffd876, #e8ab2a);
  color: #221703;
  font-weight: 700;
  font-size: 14.5px;
  border: none;
  padding: 13px 26px;
  border-radius: 11px;
  cursor: pointer;
  box-shadow: 0 10px 26px -10px rgba(255, 201, 74, 0.55);
  transition: transform 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }
  &:disabled {
    opacity: 0.55;
    cursor: default;
    box-shadow: none;
  }
  &:focus-visible {
    outline: 2px solid #4f8fe8;
    outline-offset: 2px;
  }
`;

const HistoryNote = styled.div`
  font-size: 11.5px;
  color: #93a0c4;
`;

const ResultPanel = styled.div`
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.09);
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent);
`;

const ResultIcon = styled.div<{ $tier: Tier }>`
  width: 64px;
  height: 64px;
  border-radius: 14px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  border: 1px solid ${(p) => TIER_COLOR[p.$tier]};
  background: linear-gradient(180deg, ${(p) => TIER_COLOR[p.$tier]}38, #0f1b33);
`;

const ResultName = styled.div`
  font-size: 17px;
  font-weight: 700;
`;

const ResultTier = styled.div`
  font-size: 11.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
`;

const ResultFlavor = styled.div`
  font-size: 12.5px;
  color: #93a0c4;
  margin-top: 6px;
  max-width: 420px;
`;