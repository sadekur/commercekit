<?php
namespace CommerceKit\Commerce\Classes\Base;

use CommerceKit\Commerce\Classes\Trait\Hookable;

abstract class Feature {
    use Hookable;
    protected array $settings = [];
}
