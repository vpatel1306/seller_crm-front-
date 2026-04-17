import { FiFilter } from 'react-icons/fi';
import CommonModal from '../common/CommonModal';
import Button from '../ui/Button';
import Card from '../ui/Card';

export default function OrdersFilterSection({
  title = 'Filters',
  mobileTitle = 'Apply Filters',
  mobileDescription = 'Refine the records, then apply to update the list.',
  activeCount = 0,
  isModalOpen = false,
  onOpenModal,
  onCloseModal,
  onClear,
  onApply,
  children,
  desktopOnly = false,
  showMobileToggle = true,
  modalClassName = 'xl:hidden max-w-[620px] bg-[#f8f6f1]',
}) {
  return (
    <>
      {showMobileToggle && !desktopOnly ? (
        <div className="xl:hidden">
          <Button variant="secondary" className="w-full justify-between" onClick={onOpenModal}>
            <span className="inline-flex items-center gap-2">
              <FiFilter size={16} />
              Filters
            </span>
            <span className="rounded-full bg-surface-alt px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.18em] text-text">
              {activeCount} Active
            </span>
          </Button>
        </div>
      ) : null}

      {!desktopOnly ? (
        <CommonModal
          isOpen={isModalOpen}
          onClose={onCloseModal}
          title={mobileTitle}
          size="md"
          headerStyle="default"
          showFooter={false}
          customClass={modalClassName}
        >
          <div className="space-y-4">
            <p className="text-sm text-text-muted">{mobileDescription}</p>

            <div className="max-h-[calc(80vh-180px)] overflow-y-auto pr-1">
              {children}
            </div>

            {(onClear || onApply) ? (
              <div className="grid grid-cols-2 gap-3 border-t border-border bg-white/90 pt-4">
                <Button variant="secondary" className="w-full" onClick={onClear}>
                  Clear
                </Button>
                <Button variant="primary" className="w-full" onClick={onApply}>
                  Apply Filters
                </Button>
              </div>
            ) : null}
          </div>
        </CommonModal>
      ) : null}

      <Card title={title} muted className={desktopOnly ? '' : 'hidden xl:block'}>
        {children}
      </Card>
    </>
  );
}
