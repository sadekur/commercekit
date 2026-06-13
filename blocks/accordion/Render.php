<?php
class AccordionRender {

    private array $a;

    public function __construct( array $attributes ) {
        $this->a = $attributes;
    }

    public function render(): void {
        $a = $this->a;

        $sections          = $a['sections']          ?? [];
        $borderColor       = $a['borderColor']       ?? '#000';
        $borderSize        = $a['borderSize']        ?? '1px';
        $borderStyle       = $a['borderStyle']       ?? 'solid';
        $titleColor        = $a['titleColor']        ?? '#000';
        $titleFontSize     = $a['titleFontSize']     ?? '16px';
        $titleFontFamily   = $a['titleFontFamily']   ?? 'inherit';
        $contentColor      = $a['contentColor']      ?? '#000';
        $contentFontSize   = $a['contentFontSize']   ?? '14px';
        $contentFontFamily = $a['contentFontFamily'] ?? 'inherit';

        ob_start();
        ?>
<div class="commerce-kit-accordion">
    <?php foreach ( $sections as $index => $section ) : ?>
        <div
            class="accordion-section <?php echo $section['isOpen'] ? 'is-open' : ''; ?>"
            style="border: <?php echo esc_attr( $borderSize ); ?> <?php echo esc_attr( $borderStyle ); ?> <?php echo esc_attr( $borderColor ); ?>; margin-bottom: 10px; padding: 10px;">
            <div class="commerce-kit-accordion-header flex"
                style="cursor: pointer; color: <?php echo esc_attr( $titleColor ); ?>; font-size: <?php echo esc_attr( $titleFontSize ); ?>; font-family: <?php echo esc_attr( $titleFontFamily ); ?>;"
                data-index="<?php echo esc_attr( $index ); ?>">
                <h3><?php echo esc_html( $section['title'] ); ?></h3>
                <span class="accordion-icon"><?php echo $section['isOpen'] ? '-' : '+'; ?></span>
            </div>
            <div
                class="accordion-content"
                style="color: <?php echo esc_attr( $contentColor ); ?>; font-size: <?php echo esc_attr( $contentFontSize ); ?>; font-family: <?php echo esc_attr( $contentFontFamily ); ?>; display: <?php echo $section['isOpen'] ? 'block' : 'none'; ?>;">
                <?php echo wp_kses_post( $section['content'] ); ?>
            </div>
        </div>
    <?php endforeach; ?>
</div>
        <?php
        echo ob_get_clean(); // phpcs:ignore WordPress.Security.EscapeOutput
    }
}
